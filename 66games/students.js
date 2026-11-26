// 66Games: loads the roll list from students.json (used by every page)
const STUDENTS = {};
let studentsError = '';
function addStudents(list) {
  // "5" and "005" in the file both work
  for (const roll in list) STUDENTS[roll.padStart(3, '0')] = list[roll];
}
const studentsReady = fetch('students.json', { cache: 'no-cache' })
  .then(r => { if (!r.ok) throw new Error('error ' + r.status); return r.json(); })
  .then(list => {
    addStudents(list);
    try { localStorage.setItem('66games_students', JSON.stringify(list)); } catch (e) {}
  })
  .catch(err => {
    studentsError = err.message;
    console.error('students.json failed to load:', err);
    // use the last good copy saved on this device
    try { addStudents(JSON.parse(localStorage.getItem('66games_students'))); } catch (e) {}
  });
