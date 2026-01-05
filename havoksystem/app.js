/**
 * app.js
 * Main application logic.
 * Initializes data and renders the view.
 */

// --- 1. Data Initialization Phase ---

// Create the Main Profile User
const mainUser = new User(1, "Havok", "havok", "Coding like it's 2006", "https://placehold.co/200x200/222/FFF?text=Me");
mainUser.setBio(
    "I am a full stack developer bringing back the golden age of social media. <br><br><b>Status:</b> Coding...",
    "Other developers, designers, and people who remember customizing their layouts with raw CSS."
);

mainUser.addInterest("Music", "Synthwave, Daft Punk, The Prodigy, 8-bit chiptunes");
mainUser.addInterest("Movies", "Hackers, The Matrix, Tron");
mainUser.addInterest("Television", "Mr. Robot, Halt and Catch Fire");
mainUser.addInterest("Books", "Neuromancer, Snow Crash");

// Create Dummy Friends (The "Top 8" Simulation)
const friendNames = ["Tom", "Sarah", "CodeMaster", "RetroGamer", "SkaterBoi", "EmoKid06", "PixelArtist", "MusicLover"];

friendNames.forEach((name, index) => {
    // Generate a random-ish placeholder image
    const friend = new User(index + 2, name, name.toLowerCase(), "Hello!", `https://placehold.co/100x100/6699CC/FFF?text=${name}`);
    mainUser.addFriend(friend);
});

// Create Comments
const c1 = new Comment("Tom", "https://placehold.co/80x80/red/white?text=Tom", "Jan 4 2006", "Welcome to the Havok System! Cool profile.");
const c2 = new Comment("RetroGamer", "https://placehold.co/80x80/green/white?text=Retro", "Jan 3 2006", "Nice CSS skills. PC4PC?");
const c3 = new Comment("Sarah", "https://placehold.co/80x80/purple/white?text=Sarah", "Jan 2 2006", "Thanks for the add!");

mainUser.receiveComment(c1);
mainUser.receiveComment(c2);
mainUser.receiveComment(c3);


// --- 2. View Rendering Class ---

class ProfileRenderer {
    constructor(user) {
        this.user = user;
    }

    render() {
        // Render Basic Info
        this.setText("user-name-display", this.user.name);
        this.setTextByClass("dynamic-name", this.user.name);
        this.setTextByClass("dynamic-handle", this.user.handle);
        
        document.getElementById("profile-pic").src = this.user.picUrl;
        document.getElementById("about-me-text").innerHTML = this.user.aboutMe;
        document.getElementById("meet-text").innerHTML = this.user.whoToMeet;
        document.getElementById("friend-count").innerText = this.user.getFriendCount();

        // Render Interests
        this.renderInterests();

        // Render Friends
        this.renderFriends();

        // Render Comments
        this.renderComments();
    }

    setText(id, text) {
        const el = document.getElementById(id);
        if(el) el.innerText = text;
    }

    setTextByClass(className, text) {
        const els = document.querySelectorAll(`.${className}`);
        els.forEach(el => el.innerText = text);
    }

    renderInterests() {
        const container = document.getElementById("interests-container");
        let html = "";
        for (const [category, value] of Object.entries(this.user.interests)) {
            html += `
                <div class="interest-row">
                    <div class="interest-label">${category}:</div>
                    <div class="interest-data">${value}</div>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    renderFriends() {
        const container = document.getElementById("top-friends-container");
        let html = "";
        // Only show top 8
        const top8 = this.user.friends.slice(0, 8);
        
        top8.forEach(friend => {
            html += `
                <div class="friend-card">
                    <a href="#">
                        <span class="friend-name">${friend.name}</span>
                        <img src="${friend.picUrl}" alt="${friend.name}">
                    </a>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    renderComments() {
        const container = document.getElementById("comments-container");
        let html = "";
        
        this.user.comments.forEach(comment => {
            html += `
                <div class="comment-row">
                    <div class="comment-avatar">
                        <a href="#">${comment.authorName}</a><br>
                        <img src="${comment.authorPic}" alt="${comment.authorName}">
                    </div>
                    <div class="comment-body">
                        <span class="comment-meta">${comment.date}</span>
                        ${comment.text}
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }
}

// --- 3. Execution ---

// Wait for DOM to load, then render
document.addEventListener("DOMContentLoaded", () => {
    const renderer = new ProfileRenderer(mainUser);
    renderer.render();
});
