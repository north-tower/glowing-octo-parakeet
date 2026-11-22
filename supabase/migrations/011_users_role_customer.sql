-- Marketplace people stay customers. A shop is vendors.owner_id, not users.role.
update users
set role = 'customer'
where role = 'vendor';
