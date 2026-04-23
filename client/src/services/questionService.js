const decodeHTML = (html) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};

// Educational categories: 9 (General), 17 (Science), 18 (Computers), 19 (Math), 21 (Sports), 22 (Geography), 23 (History), 27 (Animals)
const EDUCATIONAL_CATEGORIES = [9, 17, 19, 21, 22, 23, 27];

const LOCAL_FALLBACKS = [
    { text: "What is 15 + 7?", options: ["21", "22", "23", "20"], correct: "22", category: "Math", difficulty: "easy" },
    { text: "How many legs does a spider have?", options: ["6", "8", "10", "4"], correct: "8", category: "Nature", difficulty: "easy" },
    { text: "What color do you get by mixing Red and Yellow?", options: ["Green", "Purple", "Orange", "Pink"], correct: "Orange", category: "Art", difficulty: "easy" },
    { text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: "Mars", category: "Science", difficulty: "easy" },
    { text: "What is the capital of India?", options: ["Mumbai", "New Delhi", "Kolkata", "Chennai"], correct: "New Delhi", category: "Geography", difficulty: "easy" },
    { text: "What is 100 - 45?", options: ["55", "65", "45", "75"], correct: "55", category: "Math", difficulty: "easy" },
    { text: "Which gas do humans need to breathe to live?", options: ["Nitrogen", "Carbon Dioxide", "Oxygen", "Hydrogen"], correct: "Oxygen", category: "Science", difficulty: "easy" },
    { text: "How many months are there in a year?", options: ["10", "12", "11", "13"], correct: "12", category: "General", difficulty: "easy" },
    { text: "What is the opposite of 'Large'?", options: ["Big", "Huge", "Small", "Wide"], correct: "Small", category: "English", difficulty: "easy" },
    { text: "Which animal is the 'King of the Jungle'?", options: ["Tiger", "Elephant", "Lion", "Giraffe"], correct: "Lion", category: "Animals", difficulty: "easy" },
    { text: "What is 5 x 8?", options: ["35", "40", "45", "30"], correct: "40", category: "Math", difficulty: "easy" },
    { text: "Which shape has three sides?", options: ["Square", "Circle", "Triangle", "Rectangle"], correct: "Triangle", category: "Math", difficulty: "easy" },
    { text: "What do bees make?", options: ["Milk", "Honey", "Silk", "Wax"], correct: "Honey", category: "Nature", difficulty: "easy" },
    { text: "How many days are in a week?", options: ["5", "7", "6", "8"], correct: "7", category: "General", difficulty: "easy" },
    { text: "Which is the tallest animal?", options: ["Elephant", "Giraffe", "Lion", "Bear"], correct: "Giraffe", category: "Animals", difficulty: "easy" },
    { text: "What is the result of 12 divided by 3?", options: ["3", "4", "5", "2"], correct: "4", category: "Math", difficulty: "easy" },
    { text: "Who was the first person to walk on the Moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "Elon Musk"], correct: "Neil Armstrong", category: "History", difficulty: "easy" },
    { text: "What is the name of the star that shines during the day?", options: ["The Moon", "The Sun", "Mars", "Sirius"], correct: "The Sun", category: "Science", difficulty: "easy" },
    { text: "Which ocean is the largest?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: "Pacific", category: "Geography", difficulty: "easy" },
    { text: "What do you call a baby frog?", options: ["Cub", "Tadpole", "Kitten", "Puppy"], correct: "Tadpole", category: "Nature", difficulty: "easy" }
];

export const fetchQuestions = async (amount = 10, category = '', difficulty = '') => {
    try {
       
        const categoryToUse = category || EDUCATIONAL_CATEGORIES[Math.floor(Math.random() * EDUCATIONAL_CATEGORIES.length)];
        const url = `https://opentdb.com/api.php?amount=${amount}&type=multiple&category=${categoryToUse}${difficulty ? `&difficulty=${difficulty}` : ''}`;

        const response = await fetch(url);
        const data = await response.json();

        let questions = [];

        if (data.response_code === 0) {
            questions = data.results.map(q => {
                const options = [...q.incorrect_answers, q.correct_answer]
                    .map(opt => decodeHTML(opt))
                    .sort(() => Math.random() - 0.5);

                return {
                    text: decodeHTML(q.question),
                    options: options,
                    correct: decodeHTML(q.correct_answer),
                    category: q.category,
                    difficulty: q.difficulty
                };
            });
        }

        // If we don't have enough questions from the API, pad with local fallbacks
        if (questions.length < amount) {
            const extraNeeded = amount - questions.length;
            const shuffledLocal = [...LOCAL_FALLBACKS].sort(() => Math.random() - 0.5);
            questions = [...questions, ...shuffledLocal.slice(0, extraNeeded)];
        }

        return questions.sort(() => Math.random() - 0.5);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return [...LOCAL_FALLBACKS].sort(() => Math.random() - 0.5).slice(0, amount);
    }
};
