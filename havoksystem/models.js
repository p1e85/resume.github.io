/**
 * models.js
 * Defines the OOP Classes for the Havok System
 */

// Class representing a single Comment on a profile
class Comment {
    constructor(authorName, authorPic, date, text) {
        this.authorName = authorName;
        this.authorPic = authorPic;
        this.date = date;
        this.text = text;
    }
}

// Class representing a User in the system
class User {
    constructor(id, name, handle, tagline, picUrl) {
        this.id = id;
        this.name = name;
        this.handle = handle;
        this.tagline = tagline;
        this.picUrl = picUrl;
        
        // Data properties
        this.aboutMe = "";
        this.whoToMeet = "";
        this.interests = {}; // Object like { Music: "Band A", Movies: "Movie B" }
        
        // Relationships
        this.friends = []; // Array of User objects
        this.comments = []; // Array of Comment objects
    }

    // Setters for bio
    setBio(about, meet) {
        this.aboutMe = about;
        this.whoToMeet = meet;
    }

    // Add interest category
    addInterest(category, items) {
        this.interests[category] = items;
    }

    // Add a friend object to the top 8
    addFriend(userObj) {
        this.friends.push(userObj);
    }

    // Add a comment
    receiveComment(commentObj) {
        this.comments.push(commentObj);
    }

    // Getter for friend count
    getFriendCount() {
        return this.friends.length;
    }
}
