// questions.js
const questionPool = [
    // Addition (25 Questions)
    { question: "2 + 3 = ?", options: [6, 7, 5, 4], correct: 5 },
    { question: "6 + 2 = ?", options: [4, 9, 7, 8], correct: 8 },
    { question: "4 + 5 = ?", options: [10, 9, 7, 8], correct: 9 },
    { question: "3 + 6 = ?", options: [6, 9, 8, 7], correct: 9 },
    { question: "1 + 7 = ?", options: [9, 6, 8, 7], correct: 8 },
    { question: "5 + 4 = ?", options: [7, 10, 9, 8], correct: 9 },
    { question: "2 + 8 = ?", options: [11, 9, 12, 10], correct: 10 },
    { question: "7 + 3 = ?", options: [10, 12, 9, 11], correct: 10 },
    { question: "6 + 5 = ?", options: [12, 11, 10, 8], correct: 11 },
    { question: "9 + 2 = ?", options: [14, 10, 11, 12], correct: 11 },
    { question: "4 + 7 = ?", options: [8, 11, 10, 12], correct: 11 },
    { question: "8 + 1 = ?", options: [11, 8, 10, 9], correct: 9 },
    { question: "12 + 15 = ?", options: [28, 25, 27, 26], correct: 27 },
    { question: "23 + 14 = ?", options: [37, 35, 38, 36], correct: 37 },
    { question: "45 + 32 = ?", options: [78, 75, 77, 76], correct: 77 },
    { question: "11 + 19 = ?", options: [31, 28, 30, 29], correct: 30 },
    { question: "56 + 21 = ?", options: [78, 80, 77, 79], correct: 77 },
    { question: "34 + 12 = ?", options: [45, 47, 46, 44], correct: 46 },
    { question: "28 + 39 = ?", options: [68, 67, 70, 69], correct: 67 },
    { question: "17 + 25 = ?", options: [44, 41, 42, 43], correct: 42 },
    { question: "66 + 14 = ?", options: [81, 78, 80, 79], correct: 80 },
    { question: "31 + 48 = ?", options: [80, 82, 79, 81], correct: 79 },
    { question: "27 + 33 = ?", options: [59, 60, 61, 58], correct: 60 },
    { question: "15 + 28 = ?", options: [44, 42, 45, 43], correct: 43 },
    { question: "53 + 22 = ?", options: [77, 74, 75, 76], correct: 75 },

    // Subtraction (25 Questions)
    { question: "9 - 3 = ?", options: [7, 4, 6, 5], correct: 6 },
    { question: "8 - 2 = ?", options: [4, 7, 6, 5], correct: 6 },
    { question: "7 - 4 = ?", options: [2, 4, 3, 1], correct: 3 },
    { question: "6 - 5 = ?", options: [2, 0, 1, 3], correct: 1 },
    { question: "9 - 7 = ?", options: [3, 1, 2, 4], correct: 2 },
    { question: "10 - 6 = ?", options: [5, 3, 4, 6], correct: 4 },
    { question: "15 - 8 = ?", options: [8, 5, 7, 6], correct: 7 },
    { question: "12 - 4 = ?", options: [7, 8, 9, 6], correct: 8 },
    { question: "14 - 9 = ?", options: [6, 4, 7, 5], correct: 5 },
    { question: "18 - 7 = ?", options: [10, 11, 12, 9], correct: 11 },
    { question: "21 - 13 = ?", options: [8, 9, 6, 7], correct: 8 },
    { question: "30 - 15 = ?", options: [14, 12, 15, 13], correct: 15 },
    { question: "27 - 18 = ?", options: [10, 7, 9, 8], correct: 9 },
    { question: "25 - 9 = ?", options: [17, 14, 16, 15], correct: 16 },
    { question: "40 - 22 = ?", options: [17, 18, 15, 16], correct: 18 },
    { question: "33 - 11 = ?", options: [21, 23, 22, 20], correct: 22 },
    { question: "50 - 29 = ?", options: [20, 21, 19, 18], correct: 21 },
    { question: "64 - 42 = ?", options: [20, 22, 19, 21], correct: 22 },
    { question: "72 - 31 = ?", options: [40, 38, 41, 39], correct: 41 },
    { question: "55 - 24 = ?", options: [30, 28, 31, 29], correct: 31 },
    { question: "90 - 45 = ?", options: [43, 45, 42, 44], correct: 45 },
    { question: "81 - 33 = ?", options: [49, 47, 48, 46], correct: 48 },
    { question: "68 - 27 = ?", options: [39, 41, 38, 40], correct: 41 },
    { question: "100 - 59 = ?", options: [40, 41, 42, 39], correct: 41 },
    { question: "99 - 55 = ?", options: [43, 44, 45, 42], correct: 44 },

    // Multiplication (25 Questions)
    { question: "2 × 2 = ?", options: [3, 2, 5, 4], correct: 4 },
    { question: "3 × 3 = ?", options: [10, 9, 6, 8], correct: 9 },
    { question: "4 × 2 = ?", options: [7, 8, 9, 6], correct: 8 },
    { question: "5 × 2 = ?", options: [9, 11, 10, 8], correct: 10 },
    { question: "6 × 3 = ?", options: [17, 18, 15, 16], correct: 18 },
    { question: "7 × 2 = ?", options: [15, 12, 14, 13], correct: 14 },
    { question: "8 × 2 = ?", options: [15, 17, 16, 14], correct: 16 },
    { question: "3 × 4 = ?", options: [11, 12, 10, 13], correct: 12 },
    { question: "5 × 3 = ?", options: [14, 15, 16, 13], correct: 15 },
    { question: "4 × 5 = ?", options: [21, 20, 18, 19], correct: 20 },
    { question: "6 × 5 = ?", options: [29, 30, 31, 28], correct: 30 },
    { question: "7 × 3 = ?", options: [23, 21, 20, 22], correct: 21 },
    { question: "9 × 2 = ?", options: [16, 18, 15, 17], correct: 18 },
    { question: "8 × 3 = ?", options: [25, 24, 22, 23], correct: 24 },
    { question: "9 × 4 = ?", options: [31, 36, 30, 32], correct: 36 },
    { question: "5 × 6 = ?", options: [29, 31, 30, 28], correct: 30 },
    { question: "7 × 5 = ?", options: [36, 35, 37, 34], correct: 35 },
    { question: "8 × 4 = ?", options: [32, 30, 33, 31], correct: 32 },
    { question: "9 × 3 = ?", options: [28, 25, 27, 26], correct: 27 },
    { question: "10 × 2 = ?", options: [16, 20, 21, 15], correct: 20 },
    { question: "11 × 2 = ?", options: [23, 22, 20, 21], correct: 22 },
    { question: "12 × 2 = ?", options: [23, 25, 24, 22], correct: 24 },
    { question: "10 × 3 = ?", options: [31, 27, 30, 28], correct: 30 },
    { question: "11 × 3 = ?", options: [33, 30, 34, 31], correct: 33 },
    { question: "12 × 3 = ?", options: [35, 36, 37, 34], correct: 36 },

    // Division (25 Questions)
    { question: "4 ÷ 2 = ?", options: [3, 2, 4, 1], correct: 2 },
    { question: "6 ÷ 3 = ?", options: [2, 4, 1, 3], correct: 2 },
    { question: "8 ÷ 2 = ?", options: [3, 5, 4, 2], correct: 4 },
    { question: "9 ÷ 3 = ?", options: [4, 3, 2, 5], correct: 3 },
    { question: "10 ÷ 2 = ?", options: [6, 3, 5, 4], correct: 5 },
    { question: "12 ÷ 4 = ?", options: [5, 2, 3, 4], correct: 3 },
    { question: "14 ÷ 2 = ?", options: [8, 7, 5, 6], correct: 7 },
    { question: "15 ÷ 3 = ?", options: [6, 5, 3, 4], correct: 5 },
    { question: "16 ÷ 4 = ?", options: [3, 4, 2, 5], correct: 4 },
    { question: "18 ÷ 3 = ?", options: [7, 6, 4, 5], correct: 6 },
    { question: "20 ÷ 5 = ?", options: [5, 4, 3, 2], correct: 4 },
    { question: "21 ÷ 7 = ?", options: [4, 3, 5, 2], correct: 3 },
    { question: "24 ÷ 4 = ?", options: [5, 7, 6, 4], correct: 6 },
    { question: "25 ÷ 5 = ?", options: [4, 5, 6, 3], correct: 5 },
    { question: "27 ÷ 3 = ?", options: [7, 9, 6, 8], correct: 9 },
    { question: "30 ÷ 5 = ?", options: [7, 4, 6, 5], correct: 6 },
    { question: "32 ÷ 4 = ?", options: [9, 8, 7, 6], correct: 8 },
    { question: "35 ÷ 7 = ?", options: [4, 5, 3, 6], correct: 5 },
    { question: "40 ÷ 8 = ?", options: [6, 5, 3, 4], correct: 5 },
    { question: "42 ÷ 6 = ?", options: [8, 7, 5, 6], correct: 7 },
    { question: "45 ÷ 9 = ?", options: [6, 5, 7, 4], correct: 5 },
    { question: "48 ÷ 6 = ?", options: [7, 8, 9, 6], correct: 8 },
    { question: "50 ÷ 5 = ?", options: [8, 10, 7, 9], correct: 10 },
    { question: "54 ÷ 9 = ?", options: [7, 5, 6, 8], correct: 6 },
    { question: "60 ÷ 10 = ?", options: [8, 6, 5, 7], correct: 6 }
];
