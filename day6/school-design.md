# School Database Design

## Students Table

The students table stores information about students. Each student has a unique ID, name and email address. The email field is unique so that two students cannot use the same email.

## Courses Table

The courses table stores the courses offered by the school. Each course has a unique ID and a course name.

## Enrolments Table

The enrolments table stores which students are enrolled in which courses. It also stores the student's grade for that course.

## Relationships

### One-to-Many

- One student can have many enrolments.
- One course can have many enrolments.

### Many-to-Many

Students and courses have a many-to-many relationship because:

- One student can take many
