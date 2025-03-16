const API_BASE = "https://rithm-jeopardy.herokuapp.com/api";
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;

let categories = [];

/** Fetch NUM_CATEGORIES random category IDs */
async function getCategoryIds() {
    try {
        let res = await axios.get(`${API_BASE}/categories?count=100`);
        let allCategories = res.data;
        let randomCategories = _.sampleSize(allCategories, NUM_CATEGORIES);
        return randomCategories.map(cat => cat.id);
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

/** Fetch category data */
async function getCategory(catId) {
    try {
        let res = await axios.get(`${API_BASE}/category?id=${catId}`);
        let catData = res.data;
        let clues = _.sampleSize(catData.clues, NUM_QUESTIONS_PER_CAT).map(clue => ({
            question: clue.question,
            answer: clue.answer,
            showing: null
        }));
        return { title: catData.title, clues };
    } catch (error) {
        console.error(`Error fetching category ${catId}:`, error);
        return { title: "Unknown", clues: [] };
    }
}

/** Fill the Jeopardy table */
async function fillTable() {
    $("#categories-row").empty();
    $("#questions-body").empty();

    for (let category of categories) {
        $("#categories-row").append(`<th>${category.title}</th>`);
    }

    for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
        let row = $("<tr>");
        for (let j = 0; j < NUM_CATEGORIES; j++) {
            row.append(`<td data-cat="${j}" data-clue="${i}" class="clue">?</td>`);
        }
        $("#questions-body").append(row);
    // for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
    //     for (let j = 0; j < NUM_CATEGORIES; j++) {
    //         const clueDiv = $(`<div class='clue' data-cat="${j}" data-clue="${i}"><span class='question-mark'>?</span></div>`);
    //         gameBoard.append(clueDiv);
        }
    }

/** Handle click event to show question/answer */
function handleClick(evt) {
    let $cell = $(evt.target);
    let catIdx = $cell.data("cat");
    let clueIdx = $cell.data("clue");
    let clue = categories[catIdx].clues[clueIdx];

//     if (clue.showing === null) {
//         $cell.text(clue.question);
//         clue.showing = "question";
//     } else if (clue.showing === "question") {
//         $cell.text(clue.answer);
//         clue.showing = "answer";
//     }
// }
if (clue.showing === null) {
    $cell.text(clue.question);
    clue.showing = "question";
} else if (clue.showing === "question") {
    $cell.text(clue.answer);
    clue.showing = "answer";
}
}

/** Start Game: Fetch categories, show loading animation, and display board */
async function setupAndStart() {
    $("#start-btn").text("Loading..."); // Change button text to "Loading..."
    $("#jeopardy").hide(); // Ensure game board is hidden initially
    $("#loading").show(); // Show loading animation

    let categoryIds = await getCategoryIds();
    categories = await Promise.all(categoryIds.map(id => getCategory(id)));

    setTimeout(() => {
        $("#loading").hide(); // Hide loading animation
        fillTable(); // Fill the table with data
        $("#jeopardy").fadeIn(); // Show the game board
        $("#start-btn").text("Restart!"); // Change button text to "Restart!"
    }, 2000);
}

/** Event Listeners */
$(document).on("click", ".clue", handleClick);
$(document).on("click", "#start-btn", setupAndStart); // Attach click listener to start button

/** Initialize game on load */
$(document).ready(() => {
    $("#jeopardy").hide(); // Hide the game board initially
    $("#loading").hide(); // Hide loading initially
    $("#start-btn").text("Start!"); // Set initial button text
});