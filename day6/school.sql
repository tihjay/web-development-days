-- CREATE TABLES

CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    course_name TEXT NOT NULL
);

CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(student_id, course_id)
);

-- SAMPLE DATA

INSERT INTO students (name, email) VALUES
('Alice Johnson', 'alice@example.com'),
('Bob Smith', 'bob@example.com'),
('Carol Davis', 'carol@example.com');

INSERT INTO courses (course_name) VALUES
('Mathematics'),
('Science'),
('History');

INSERT INTO enrolments (student_id, course_id, grade) VALUES
(1, 1, 'A'),
(1, 2, 'B'),
(2, 1, 'B+'),
(2, 3, 'A'),
(3, 2, 'A-');

-- 1. All courses for one student (Alice Johnson)

SELECT courses.course_name
FROM students
JOIN enrolments ON students.id = enrolments.student_id
JOIN courses ON courses.id = enrolments.course_id
WHERE students.name = 'Alice Johnson';

-- 2. All students on one course (Mathematics)

SELECT students.name
FROM students
JOIN enrolments ON students.id = enrolments.student_id
JOIN courses ON courses.id = enrolments.course_id
WHERE courses.course_name = 'Mathematics';

-- 3. Number of students per course

SELECT courses.course_name,
COUNT(enrolments.student_id) AS student_count
FROM courses
LEFT JOIN enrolments
ON courses.id = enrolments.course_id
GROUP BY courses.id;

-- 4. Students who have no enrolments

SELECT students.name
FROM students
LEFT JOIN enrolments
ON students.id = enrolments.student_id
WHERE enrolments.student_id IS NULL;

-- 5. Update one enrolment grade

UPDATE enrolments
SET grade = 'A+'
WHERE student_id = 1 AND course_id = 2;