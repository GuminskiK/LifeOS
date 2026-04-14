const fs = require('fs');
const text = fs.readFileSync('C:/Users/krzys/AppData/Roaming/Code/User/workspaceStorage/a1505ee8f45c707c97f1be192f5f4f48/GitHub.copilot-chat/chat-session-resources/e2bfbd25-80ff-48f8-bb5d-529702308d5d/call_MHw3TFd6TEd1SHQ5SUJldEJaSlQ__vscode-1776155302207/content.txt', 'utf8');
const start = text.indexOf('`	ypescript') + 13;
const end = text.lastIndexOf('`');
const str = text.substring(start, end).trim();
fs.writeFileSync('frontend/src/pages/notes/NotesMain.tsx', str, 'utf8');