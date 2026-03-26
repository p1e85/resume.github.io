// js/classes/Note.js
// Represents one open note/document

export class Note {
    constructor(title = "Untitled", content = "", id = null) {
        this.id = id || Date.now().toString(36) + Math.random().toString(36).substr(2);
        this.title = title;
        this.content = content;
        this.modified = false;
        this.filename = null;           // Set when user does Save As
        this.lastSaved = null;
    }

    updateContent(newContent) {
        if (this.content !== newContent) {
            this.content = newContent;
            this.modified = true;
        }
    }

    markSaved(filename = null) {
        this.modified = false;
        if (filename) this.filename = filename;
        this.lastSaved = Date.now();
    }

    getDisplayTitle() {
        let display = this.title;
        if (this.modified) display += " *";
        if (this.filename) display = this.filename.split(/[/\\]/).pop(); // basename
        return display;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            filename: this.filename
        };
    }

    static fromJSON(data) {
        const note = new Note(data.title, data.content, data.id);
        note.filename = data.filename;
        note.modified = false;
        return note;
    }
}
