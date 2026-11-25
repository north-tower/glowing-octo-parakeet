-- Shop WhatsApp shown on listing detail pages.

alter table vendors
  add column if not exists whatsapp text
    check (whatsapp is null or whatsapp ~ '^\+254[17][0-9]{8}$');
