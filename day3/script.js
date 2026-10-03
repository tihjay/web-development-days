let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. searchNotes
function searchNotes(word) {
  return notes.filter(n =>
    n.text.toLowerCase().includes(word.toLowerCase())
  );
}
console.log(searchNotes("milk")); // [{ id:1, text:"Buy milk and bread", category:"personal" }]
console.log(searchNotes("xyz"));  // []


// 2. longestNote
function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((longest, current) =>
    current.text.length > longest.text.length ? current : longest
  );
}
console.log(longestNote()); // { id:3, text:"Email the project report to Grace", category:"work" }
console.log(longestNote()); // same result, since notes not empty


// 3. countByCategory
function countByCategory() {
  let counts = {};
  for (let n of notes) {
    counts[n.category] = (counts[n.category] || 0) + 1;
  }
  return counts;
}
console.log(countByCategory()); // { personal:2, study:2, work:1 }


// 4. getSummary
function getSummary() {
  let counts = countByCategory();
  let total = notes.length;
  let parts = Object.entries(counts)
    .map(([cat, num]) => `${num} ${cat}`);
  return `${total} ${total === 1 ? "note" : "notes"}: ${parts.join(", ")}.`;
}
console.log(getSummary()); // "5 notes: 2 personal, 2 study, 1 work."


// 5. isDuplicate
function isDuplicate(text) {
  let normalized = text.trim().toLowerCase();
  return notes.some(n => n.text.trim().toLowerCase() === normalized);
}
console.log(isDuplicate("  buy milk and bread ")); // true
console.log(isDuplicate("New task")); // false


// 6. addNote
function addNote(text, category) {
  let trimmed = text.trim();
  if (trimmed.length < 1 || trimmed.length > 200) {
    console.log("Invalid length");
    return false;
  }
  if (!["personal", "work", "study"].includes(category)) {
    console.log("Invalid category");
    return false;
  }
  if (isDuplicate(trimmed)) {
    console.log("Duplicate note");
    return false;
  }
  notes.push({ id: notes.length + 1, text: trimmed, category });
  return true;
}
console.log(addNote("Read a book", "personal")); // true
console.log(addNote("Buy milk and bread", "personal")); // false (duplicate)
console.log(addNote("", "study")); // false (invalid length)
console.log(addNote("Plan trip", "travel")); // false (invalid category)
