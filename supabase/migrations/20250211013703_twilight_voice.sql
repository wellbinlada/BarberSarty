/*
  # Reset default user password
  
  Updates the password for the default user account to 'acesso123'
*/

UPDATE auth.users
SET encrypted_password = crypt('acesso123', gen_salt('bf'))
WHERE email = 'default@example.com';