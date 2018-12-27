document.querySelector(".convert-text-to-speech")
    .addEventListener("click", function() {
        const text=document.querySelector(".text").value;
        const fileName = document.querySelector(".file-name").value;
        const language = document.querySelector(".language").value;
        fetch(`/tts?text=${text}&fileName=${fileName}&language=${language}`)
    })