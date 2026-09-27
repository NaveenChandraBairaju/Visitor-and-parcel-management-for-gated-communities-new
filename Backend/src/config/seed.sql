-- Seed Data for Visitor & Parcel Management System
-- Run this after running schema.sql to insert default admin user

-- Insert Admin User
INSERT INTO users (name, email, password, role, contact_info, flat_number) 
VALUES 
('Naveen Raj', 'naveenraj123@gmail.com', 'Naveen1290$', 'admin', NULL, NULL);

-- Verify the data
SELECT id, name, email, role FROM users WHERE email = 'naveenraj123@gmail.com';
