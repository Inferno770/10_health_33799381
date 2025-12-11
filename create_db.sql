# Create database script for FitTrack

CREATE DATABASE IF NOT EXISTS health;
USE health;

# 1. Create the Users table (Same as before!)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    hashedPassword VARCHAR(255) NOT NULL
);

# 2. Create the Workouts table (This replaces 'books')
CREATE TABLE IF NOT EXISTS workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, 
    date DATE,
    activity VARCHAR(50),  -- e.g. 'Running', 'Swimming', 'Weights'
    duration INT,          -- in minutes
    calories INT,          -- approximate calories burned
    notes VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50),
    action VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE USER IF NOT EXISTS 'health_app'@'localhost' IDENTIFIED BY 'qwertyuiop'; 

GRANT ALL PRIVILEGES ON health.* TO 'health_app'@'localhost';