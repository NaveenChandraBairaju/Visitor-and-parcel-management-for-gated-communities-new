-- PostgreSQL Schema for Visitor & Parcel Management System
-- Compatible with Neon Database

-- Drop existing tables if they exist
DROP TABLE IF EXISTS frequent_visitors CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS pre_approved_visitors CASCADE;
DROP TABLE IF EXISTS visitors_parcels CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('resident', 'security', 'admin')),
    contact_info VARCHAR(20),
    flat_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitors and Parcels table (combined)
CREATE TABLE visitors_parcels (
    id SERIAL PRIMARY KEY,
    resident_id INT NOT NULL,
    security_guard_id INT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('visitor', 'parcel')),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    purpose VARCHAR(255),
    description TEXT,
    media VARCHAR(500),
    vehicle_details VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    exit_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (security_guard_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Pre-approved visitors table
CREATE TABLE pre_approved_visitors (
    id SERIAL PRIMARY KEY,
    resident_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    expected_date DATE NOT NULL,
    vehicle_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Entered', 'Cancelled', 'Expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Announcements table
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    audience VARCHAR(20) NOT NULL DEFAULT 'All' CHECK (audience IN ('All', 'Residents', 'Security')),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Frequent visitors table
CREATE TABLE frequent_visitors (
    id SERIAL PRIMARY KEY,
    resident_id INT,
    name VARCHAR(100),
    phone VARCHAR(15),
    relationship VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_visitors_parcels_resident ON visitors_parcels(resident_id);
CREATE INDEX idx_visitors_parcels_type ON visitors_parcels(type);
CREATE INDEX idx_visitors_parcels_status ON visitors_parcels(status);
CREATE INDEX idx_pre_approved_resident ON pre_approved_visitors(resident_id);
CREATE INDEX idx_frequent_visitors_resident ON frequent_visitors(resident_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on visitors_parcels
CREATE TRIGGER update_visitors_parcels_updated_at 
    BEFORE UPDATE ON visitors_parcels 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


-- ============================================
-- SEED DATA - Default Admin User
-- ============================================

-- Insert Admin User
INSERT INTO users (name, email, password, role, contact_info, flat_number) 
VALUES 
('Naveen Raj', 'naveenraj123@gmail.com', 'Naveen1290$', 'admin', NULL, NULL);

-- Display inserted admin user
SELECT 'Admin user inserted successfully!' as message;
SELECT id, name, email, role FROM users WHERE email = 'naveenraj123@gmail.com';
