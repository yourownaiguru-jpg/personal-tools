/* Work-with-me enquiry form.
   Sends one JSON POST to Web3Forms when the visitor presses Send; nothing else leaves the page.
   No third-party script is loaded.

   SETUP: get a free access key at https://web3forms.com (enter the email address that should
   receive enquiries) and paste it below. The key is designed to be public: it can only send
   mail to that one address. Until a key is set, the form stays hidden and the page shows the
   "Message me" buttons instead. */
(() => {
  'use strict';
  const ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
  const ENDPOINT = 'https://api.web3forms.com/submit';

  const form = document.getElementById('enquiry-form');
  const fallback = document.getElementById('fallback');
  const status = document.getElementById('status');
  const send = document.getElementById('send');
  const keySet = /^[0-9a-f-]{20,}$/i.test(ACCESS_KEY);
  if (!form || !keySet) return; // fallback stays visible

  form.hidden = false;
  fallback.querySelector('h2').textContent = 'Prefer to message?';
  fallback.querySelector('p').textContent = 'You can also send me a message on Instagram or X.';

  const say = (text, kind) => { status.textContent = text; status.className = 'status' + (kind ? ' ' + kind : ''); };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); say('Please fill in your name, email, interest and a short message.', 'err'); return; }
    const f = new FormData(form);
    if (f.get('botcheck')) return; // honeypot: bots tick this, people never see it
    const name = String(f.get('name')).trim(), interest = String(f.get('interest'));
    const payload = {
      access_key: ACCESS_KEY,
      subject: 'Work with me: ' + interest + ' (' + name + ')',
      from_name: 'YourAI Guru site',
      name,
      email: String(f.get('email')).trim(),
      interest,
      organisation: String(f.get('organisation') || '').trim(),
      message: String(f.get('message')).trim()
    };
    send.disabled = true; say('Sending…');
    try {
      const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || 'HTTP ' + res.status);
      form.reset();
      say('Thank you, ' + name + '. Your enquiry is sent and I will reply by email.', 'ok');
    } catch (err) {
      say('Sorry, the enquiry could not be sent. Please try again, or message me on Instagram or X below.', 'err');
    } finally {
      send.disabled = false;
    }
  });
})();
