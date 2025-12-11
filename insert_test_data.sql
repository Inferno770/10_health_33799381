USE health;

INSERT INTO users (username, first_name, last_name, email, hashedPassword)
VALUES ('gold', 'Goldie', 'Smith', 'gold@example.com', '$2a$12$IWbTTtlS38YOVdh5AmwvheMjTwHAj7WEDFrQQ1kGmq/.Hm3W/F3ey');

# 2. Insert some dummy workouts
# (Assume the gold user has ID 1)
INSERT INTO workouts (user_id, date, activity, duration, calories, notes) VALUES
(1, '2025-11-01', 'Running', 30, 300, 'Morning jog in the park'),
(1, '2025-11-02', 'Swimming', 45, 400, 'Laps at the leisure centre'),
(1, '2025-11-03', 'Yoga', 60, 200, 'Relaxing session');