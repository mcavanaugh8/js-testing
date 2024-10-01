function checkSimilarity(string1, string2) {
    if (!string1.length && !string2.length) return 1; // Both strings are empty
    if (!string1.length || !string2.length) return 0; // One of the strings is empty
    if (string1 === string2) return 1; // Strings are identical

    const bigramSet1 = new Set();
    const bigramSet2 = new Set();

    for (let i = 0; i < string1.length - 1; i++) {
        bigramSet1.add(string1.substring(i, i + 2).toLowerCase());
    }

    for (let i = 0; i < string2.length - 1; i++) {
        bigramSet2.add(string2.substring(i, i + 2).toLowerCase());
    }

    const intersection = new Set([...bigramSet1].filter(x => bigramSet2.has(x)));

    return ((2 * intersection.size) / (bigramSet1.size + bigramSet2.size)) >= 0.40;
}

function customSearch(string1, string2) {
    if (checkSimilarity(string1, string2)) return true; // Check the whole string first

    const wordsString1 = string1.split(' ');
    const wordsString2 = string2.split(' ');

    // Generate all possible continuous subsections of string2
    for (let i = 0; i <= wordsString2.length - wordsString1.length; i++) {
        for (let j = i + wordsString1.length; j <= wordsString2.length; j++) {
            const subsection = wordsString2.slice(i, j).join(' ');
            console.log(subsection)
            if (checkSimilarity(string1, subsection)) {
                return true; // If any subsection is similar, return true
            }
        }
    }

    return false; // If no similar subsections are found, return false
}

// Example usage
const string1 = "key information";
const string2 = "Ask questions about key details in a literary text with prompting and support.";

console.log(customSearch(string1, string2)); // Should evaluate using bigram similarity for all subsections
