// KONFIGURASI SUPABASE
const SUPABASE_URL = "https://cnungyarrswqtxelrnkb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNudW5neWFycnN3cXR4ZWxybmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMDUyMjAsImV4cCI6MjA1Mzc4MTIyMH0.NsqTvA_orQnXYWYuB0ZjTurLcQsL3tltKjvmnio9mwg";

// Pastikan Supabase terinisialisasi sebelum digunakan
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("Supabase instance:", supabase);

let user = null;
let currentQuestionIndex = 0;
let answers = [];

const questions = [
    { question: "Kamu lebih sering melihat insight atau hanya memposting konten?", options: ["Melihat insight", "Hanya memposting"] },
    { question: "Apakah kamu lebih fokus pada reach atau engagement?", options: ["Reach", "Engagement"] },
    { question: "Kamu lebih sering menggunakan hashtag atau tag akun lain?", options: ["Hashtag", "Tag akun lain"] }
];

const keywordsMapping = {
    "Melihat insight": ["#Analytics", "#DataDriven", "#Strategy"],
    "Hanya memposting": ["#CasualPosting", "#NoStrategy", "#ContentOnly"],
    "Reach": ["#ViralPotential", "#NewAudience", "#BrandAwareness"],
    "Engagement": ["#CommunityBuilding", "#LoyalFollowers", "#Interactive"],
    "Hashtag": ["#HashtagStrategy", "#SEO", "#Discoverability"],
    "Tag akun lain": ["#Collaboration", "#Networking", "#Exposure"]
};

// LOGIN DENGAN EMAIL
async function login() {
    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value.trim()
  
    console.log("Login attempt:", email)
  
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) {
      console.error("Login failed:", loginError)
      alert("Login gagal: " + loginError.message)
      return
    }
  
    console.log("Login successful:", loginData)
    localStorage.setItem("user", JSON.stringify(loginData.user))
    startQuiz()
  }
  
  // REGISTER DENGAN EMAIL
  async function register() {
    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value.trim()
  
    console.log("Register attempt:", email)
  
    // Buat akun di Supabase Authentication
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      console.error("Register failed:", error)
      alert("Gagal register: " + error.message)
      return
    }
  
    console.log("Register successful:", data)
    alert("Registrasi berhasil! Silakan login.")
  }

// LOGOUT
async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem("user");
    location.reload();
}

// MULAI KUIS
function startQuiz() {
    user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Harap login terlebih dahulu!");
        return;
    }

    document.getElementById("login-container").style.display = "none";
    document.getElementById("quiz-container").style.display = "block";
    showQuestion();
}

// MENAMPILKAN PERTANYAAN
function showQuestion() {
    const questionData = questions[currentQuestionIndex];
    document.getElementById("question").innerText = questionData.question;

    const optionsContainer = document.getElementById("options");
    optionsContainer.innerHTML = "";
    
    questionData.options.forEach(option => {
        let btn = document.createElement("button");
        btn.innerText = option;
        btn.onclick = () => selectAnswer(option);
        optionsContainer.appendChild(btn);
    });
}

// MEMILIH JAWABAN
function selectAnswer(option) {
    answers.push(option);
    nextQuestion();
}

// PERTANYAAN SELANJUTNYA
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResult();
    }
}

// MENAMPILKAN HASIL KUIS
async function showResult() {
    document.getElementById("quiz-container").style.display = "none";
    document.getElementById("result-container").style.display = "block";

    const selectedKeywords = answers.flatMap(answer => keywordsMapping[answer]);
    const uniqueKeywords = [...new Set(selectedKeywords)];

    document.getElementById("result-text").innerText = `Terima kasih, ${user.email}!`;
    document.getElementById("keywords").innerText = uniqueKeywords.join(", ");

    await supabase.from("quiz_results").insert([{ user_email: user.email, result_keywords: uniqueKeywords.join(", ") }]);
}

function restartQuiz() {
    currentQuestionIndex = 0
    answers = []
    document.getElementById("result-container").style.display = "none"
    document.getElementById("quiz-container").style.display = "block"
    showQuestion()
  }  