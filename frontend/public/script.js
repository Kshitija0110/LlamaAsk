document.getElementById("askButton").addEventListener("click", async () => {
    const question = document.getElementById("questionInput").value;
    const responseElement = document.getElementById("answer");

    if (!question) {
        responseElement.textContent = "Please enter a question.";
        return;
    }

    try {
        const response = await fetch("https://genai-jjxj.onrender.com/ask", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ question }),
        });

        const data = await response.json();

        const answerField = document.getElementById("answerField");
        if (response.ok) {
            answerField.style.display = "block";  // Make answer field visible
            responseElement.textContent = `Answer: ${data.answer}`;
        } else {
            responseElement.textContent = `Error: ${data.error}`;
        }
    } catch (error) {
        responseElement.textContent = `Error: ${error.message}`;
    }
});
