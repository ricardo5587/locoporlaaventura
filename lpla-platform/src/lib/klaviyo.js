const KLAVIYO_BASE = 'https://a.klaviyo.com/api';
const API_KEY = process.env.KLAVIYO_API_KEY;

async function klaviyoRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Klaviyo-API-Key ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'revision': '2024-10-15',
    },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${KLAVIYO_BASE}${endpoint}`, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Klaviyo error: ${res.status} ${err}`);
  }
  return res.json();
}

export async function getLists() {
  const data = await klaviyoRequest('/lists');
  return data.data || [];
}

export async function getSegments() {
  const data = await klaviyoRequest('/segments');
  return data.data || [];
}

export async function subscribeToList(listId, email, firstName = '', lastName = '') {
  return klaviyoRequest(`/lists/${listId}/relationships/members`, 'POST', {
    data: [{
      type: 'profile',
      attributes: {
        email,
        first_name: firstName,
        last_name: lastName,
      },
    }],
  });
}

export async function getProfiles(cursor = null) {
  const params = new URLSearchParams({
    'fields[profile]': 'email,first_name,last_name,phone_number,created,updated,location,title,organization,region,country,timezone,properties',
    'page[size]': '100',
  });
  if (cursor) params.set('page[cursor]', cursor);
  const data = await klaviyoRequest(`/profiles?${params}`);
  return data;
}

export async function getAllProfiles() {
  const all = [];
  let cursor = null;
  try {
    do {
      const data = await getProfiles(cursor);
      if (data.data && Array.isArray(data.data)) {
        all.push(...data.data);
      }
      // Check for next cursor in links
      const nextLink = data.links?.next;
      if (nextLink) {
        const url = new URL(nextLink);
        cursor = url.searchParams.get('page[cursor]');
      } else {
        cursor = null;
      }
    } while (cursor);
  } catch (err) {
    console.error('Error fetching Klaviyo profiles:', err);
    throw err;
  }
  return all;
}

export async function getProfileLists(profileId) {
  const data = await klaviyoRequest(`/profiles/${profileId}/lists`);
  return data.data || [];
}

export async function getProfileSubscriptions(profileId) {
  const data = await klaviyoRequest(`/profiles/${profileId}/relationships/subscriptions`);
  return data.data || [];
}

export async function getListMembers(listId) {
  const all = [];
  let cursor = null;
  do {
    const params = new URLSearchParams({ 'page[size]': '100' });
    if (cursor) params.set('page[cursor]', cursor);
    const data = await klaviyoRequest(`/lists/${listId}/profiles?${params}`);
    if (data.data && Array.isArray(data.data)) {
      all.push(...data.data.map(p => p.id));
    }
    const nextLink = data.links?.next;
    if (nextLink) {
      const url = new URL(nextLink);
      cursor = url.searchParams.get('page[cursor]');
    } else {
      cursor = null;
    }
  } while (cursor);
  return all;
}

export async function createCampaign(name, subject, listId, content) {
  return klaviyoRequest('/campaigns', 'POST', {
    data: {
      type: 'campaign',
      attributes: {
        name,
        subject,
        content,
      },
      relationships: {
        lists: {
          data: [{ type: 'list', id: listId }],
        },
      },
    },
  });
}
