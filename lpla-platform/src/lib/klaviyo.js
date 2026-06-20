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
    'fields[profile]': 'email,first_name,last_name,phone_number,created,updated,location',
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
  const data = await klaviyoRequest(`/profiles/${profileId}/relationships/lists`);
  return data.data || [];
}

// Fetch all profile IDs that are members of a given list (paginated).
// This lets us build a profile->lists map with O(#lists) calls instead of
// O(#profiles) calls, avoiding serverless timeouts.
export async function getListMembers(listId) {
  const ids = [];
  let cursor = null;
  do {
    const params = new URLSearchParams({ 'page[size]': '100' });
    if (cursor) params.set('page[cursor]', cursor);
    const data = await klaviyoRequest(`/lists/${listId}/relationships/profiles?${params}`);
    if (Array.isArray(data.data)) {
      ids.push(...data.data.map(d => d.id));
    }
    const nextLink = data.links?.next;
    cursor = nextLink ? new URL(nextLink).searchParams.get('page[cursor]') : null;
  } while (cursor);
  return ids;
}

export async function trackEvent(eventName, email, properties = {}, profile = {}) {
  return klaviyoRequest('/events', 'POST', {
    data: {
      type: 'event',
      attributes: {
        metric: { data: { type: 'metric', attributes: { name: eventName } } },
        profile: { data: { type: 'profile', attributes: { email, ...profile } } },
        properties,
        time: new Date().toISOString(),
      },
    },
  });
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

export async function getTemplates() {
  const data = await klaviyoRequest('/templates');
  return data.data || [];
}

export async function createTemplate(name, html) {
  return klaviyoRequest('/templates', 'POST', {
    data: {
      type: 'template',
      attributes: {
        name,
        editor_type: 'CODE',
        html,
      },
    },
  });
}

export async function updateTemplate(templateId, html, name) {
  const attributes = { html };
  if (name) attributes.name = name;
  return klaviyoRequest(`/templates/${templateId}`, 'PATCH', {
    data: {
      type: 'template',
      id: templateId,
      attributes,
    },
  });
}

export async function getTemplate(templateId) {
  const data = await klaviyoRequest(`/templates/${templateId}`);
  return data.data;
}

export async function getFlows() {
  const data = await klaviyoRequest('/flows');
  return data.data || [];
}
