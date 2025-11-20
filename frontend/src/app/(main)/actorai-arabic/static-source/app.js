// ActorAI Pro - TypeScript-style JavaScript Application
// Type definitions as comments for clarity

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {Object} Script
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {string} content
 * @property {string} uploadDate
 * @property {string} status
 */

// ==================== STATE MANAGEMENT ====================

class AppState {
  constructor() {
    this.currentPage = "home";
    this.theme = "light";
    this.user = null;
    this.scripts = [];
    this.recordings = [];
    this.listeners = [];
    this.initializeData();
  }

  initializeData() {
    // Sample data
    this.scripts = [
      {
        id: "1",
        title: "Romeo & Juliet - Balcony Scene",
        author: "William Shakespeare",
        content: this.getSampleScript(),
        uploadDate: "2025-10-28",
        status: "analyzed",
      },
      {
        id: "2",
        title: "Hamlet - To be or not to be",
        author: "William Shakespeare",
        content: "Sample text...",
        uploadDate: "2025-10-26",
        status: "analyzed",
      },
      {
        id: "3",
        title: "A Streetcar Named Desire - Scene 3",
        author: "Tennessee Williams",
        content: "Sample text...",
        uploadDate: "2025-10-25",
        status: "processing",
      },
    ];

    this.recordings = [
      {
        id: "1",
        title: "Romeo & Juliet - Take 3",
        duration: "3:42",
        date: "2025-10-30",
        score: 82,
        thumbnail: "",
      },
      {
        id: "2",
        title: "Hamlet - Take 1",
        duration: "4:15",
        date: "2025-10-29",
        score: 76,
        thumbnail: "",
      },
    ];
  }

  getSampleScript() {
    return `INT. CAPULET'S GARDEN - NIGHT\n\nROMEO stands beneath JULIET's balcony, looking up.\n\nROMEO\nBut soft, what light through yonder window breaks?\nIt is the east, and Juliet is the sun.\n\nJULIET appears at the window above.\n\nJULIET\nO Romeo, Romeo, wherefore art thou Romeo?\nDeny thy father and refuse thy name.\n\nROMEO\nShall I hear more, or shall I speak at this?\n\nJULIET\n'Tis but thy name that is my enemy.\nWhat's in a name? That which we call a rose\nBy any other name would smell as sweet.`;
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener());
  }

  setPage(page) {
    this.currentPage = page;
    this.notify();
    window.scrollTo(0, 0);
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", this.theme);
    this.notify();
  }

  login(email, _password) {
    // Simulated login
    this.user = {
      id: "1",
      name: "Sarah Mitchell",
      email: email,
    };
    this.setPage("dashboard");
  }

  register(name, email, _password) {
    // Simulated registration
    this.user = {
      id: "1",
      name: name,
      email: email,
    };
    this.setPage("dashboard");
  }

  logout() {
    this.user = null;
    this.setPage("home");
  }
}

const appState = new AppState();

// ==================== ROUTER ====================

class Router {
  navigate(page) {
    appState.setPage(page);
  }

  getParams() {
    // Simple parameter extraction from page name
    const parts = appState.currentPage.split("/");
    return parts.length > 1 ? parts[1] : null;
  }
}

const router = new Router();

// ==================== COMPONENTS ====================

class Component {
  constructor() {
    this.state = {};
  }

  createElement(tag, props = {}, ...children) {
    const element = document.createElement(tag);

    Object.keys(props).forEach((key) => {
      if (key === "className") {
        element.className = props[key];
      } else if (key === "onClick") {
        element.addEventListener("click", props[key]);
      } else if (key === "onChange") {
        element.addEventListener("change", props[key]);
      } else if (key === "onSubmit") {
        element.addEventListener("submit", props[key]);
      } else if (key === "style") {
        Object.assign(element.style, props[key]);
      } else {
        element.setAttribute(key, props[key]);
      }
    });

    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      } else if (Array.isArray(child)) {
        child.forEach((c) => {
          if (c instanceof Node) element.appendChild(c);
        });
      }
    });

    return element;
  }

  render() {
    return this.createElement("div", {}, "Component");
  }
}

// ==================== NAVBAR COMPONENT ====================

class Navbar extends Component {
  render() {
    const { user } = appState;

    const nav = this.createElement(
      "nav",
      { className: "navbar" },
      this.createElement(
        "div",
        { className: "navbar-content" },
        this.createElement(
          "a",
          {
            className: "navbar-logo",
            onClick: () => router.navigate("home"),
          },
          this.createElement("span", {}, "🎭"),
          this.createElement("span", {}, "ActorAI Pro")
        ),
        this.createElement(
          "ul",
          { className: "navbar-menu" },
          this.createElement(
            "li",
            {},
            this.createElement(
              "a",
              {
                className: `navbar-link ${currentPage === "home" ? "active" : ""}`,
                onClick: () => router.navigate("home"),
              },
              "الرئيسية"
            )
          ),
          this.createElement(
            "li",
            {},
            this.createElement(
              "a",
              {
                className: `navbar-link ${currentPage === "demo" ? "active" : ""}`,
                onClick: () => router.navigate("demo"),
              },
              "التجربة"
            )
          ),
          user
            ? [
                this.createElement(
                  "li",
                  {},
                  this.createElement(
                    "a",
                    {
                      className: `navbar-link ${currentPage === "dashboard" ? "active" : ""}`,
                      onClick: () => router.navigate("dashboard"),
                    },
                    "لوحة التحكم"
                  )
                ),
                this.createElement(
                  "li",
                  {},
                  this.createElement(
                    "button",
                    {
                      className: "btn btn-primary btn-sm",
                      onClick: () => appState.logout(),
                    },
                    "تسجيل الخروج"
                  )
                ),
              ]
            : [
                this.createElement(
                  "li",
                  {},
                  this.createElement(
                    "button",
                    {
                      className: "btn btn-outline btn-sm",
                      onClick: () => router.navigate("login"),
                    },
                    "تسجيل الدخول"
                  )
                ),
                this.createElement(
                  "li",
                  {},
                  this.createElement(
                    "button",
                    {
                      className: "btn btn-primary btn-sm",
                      onClick: () => router.navigate("register"),
                    },
                    "ابدأ الآن"
                  )
                ),
              ]
        )
      )
    );

    return nav;
  }
}

// ==================== HERO SECTION ====================

class HeroSection extends Component {
  render() {
    return this.createElement(
      "section",
      { className: "hero fade-in" },
      this.createElement(
        "div",
        { className: "container" },
        this.createElement(
          "h1",
          { className: "mb-6" },
          "حوّل مستواك التمثيلي مع الذكاء الاصطناعي"
        ),
        this.createElement(
          "p",
          {
            className: "text-secondary",
            style: {
              fontSize: "20px",
              maxWidth: "600px",
              margin: "0 auto 2rem",
            },
          },
          "أتقن حرفتك مع تحليل النصوص بالذكاء الاصطناعي وشركاء المشهد الافتراضيين وتحليلات الأداء"
        ),
        this.createElement(
          "div",
          { className: "flex gap-4 justify-center" },
          this.createElement(
            "button",
            {
              className: "btn btn-primary btn-lg",
              onClick: () => router.navigate("demo"),
            },
            "🎬 جرّب التطبيق"
          ),
          this.createElement(
            "button",
            {
              className: "btn btn-outline btn-lg",
              onClick: () => router.navigate("register"),
            },
            "ابدأ الآن"
          )
        ),
        this.createElement(
          "div",
          {
            className: "mt-8",
            style: { fontSize: "60px", opacity: "0.3" },
          },
          "🎭"
        )
      )
    );
  }
}

// ==================== FEATURES SECTION ====================

class FeaturesSection extends Component {
  render() {
    const features = [
      {
        icon: "🧠",
        title: "تحليل النصوص",
        description:
          "تحليل عميق للأهداف والعقبات والأقواس العاطفية باستخدام منهجيات تمثيل مُثبتة",
      },
      {
        icon: "💬",
        title: "شريك المشهد الذكي",
        description:
          "تدرّب على المشاهد مع شريك ذكاء اصطناعي ذكي يستجيب بشكل طبيعي لأدائك",
      },
      {
        icon: "📊",
        title: "تحليل الأداء",
        description:
          "ملاحظات تفصيلية حول الأصالة العاطفية والإلقاء الصوتي والحضور الجسدي",
      },
      {
        icon: "📈",
        title: "تتبع التقدم",
        description:
          "راقب نموك من خلال تحليلات شاملة ونصائح تدريب مخصصة",
      },
    ];

    return this.createElement(
      "section",
      { className: "section" },
      this.createElement(
        "div",
        { className: "container" },
        this.createElement("h2", { className: "text-center mb-8" }, "الميزات"),
        this.createElement(
          "div",
          { className: "grid grid-4" },
          features.map((feature) =>
            this.createElement(
              "div",
              { className: "card slide-up" },
              this.createElement(
                "div",
                { style: { fontSize: "40px", marginBottom: "1rem" } },
                feature.icon
              ),
              this.createElement("h4", { className: "mb-4" }, feature.title),
              this.createElement(
                "p",
                { className: "text-secondary" },
                feature.description
              )
            )
          )
        )
      )
    );
  }
}

// ==================== HOW IT WORKS SECTION ====================

class HowItWorksSection extends Component {
  render() {
    const steps = [
      {
        number: "1",
        title: "ارفع نصك",
        description: "استورد أي نص بصيغة نصية",
      },
      {
        number: "2",
        title: "حلّل وتدرّب",
        description: "احصل على رؤى الذكاء الاصطناعي وتدرّب مع شركاء افتراضيين",
      },
      {
        number: "3",
        title: "تتبع تقدمك",
        description: "راقب التحسينات وأتقن حرفتك",
      },
    ];

    return this.createElement(
      "section",
      { className: "section", style: { background: "var(--surface)" } },
      this.createElement(
        "div",
        { className: "container" },
        this.createElement(
          "h2",
          { className: "text-center mb-8" },
          "كيف يعمل"
        ),
        this.createElement(
          "div",
          { className: "grid grid-3" },
          steps.map((step) =>
            this.createElement(
              "div",
              { className: "text-center" },
              this.createElement(
                "div",
                {
                  className: "mb-4",
                  style: {
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    margin: "0 auto 1rem",
                  },
                },
                step.number
              ),
              this.createElement("h4", { className: "mb-4" }, step.title),
              this.createElement(
                "p",
                { className: "text-secondary" },
                step.description
              )
            )
          )
        )
      )
    );
  }
}

// ==================== FOOTER ====================

class Footer extends Component {
  render() {
    return this.createElement(
      "footer",
      { className: "footer" },
      this.createElement(
        "div",
        { className: "footer-content" },
        this.createElement(
          "div",
          { className: "footer-section" },
          this.createElement("h6", {}, "ActorAI Pro"),
          this.createElement(
            "p",
            { className: "text-secondary" },
            "منصة تدريب الممثلين بالذكاء الاصطناعي"
          )
        ),
        this.createElement(
          "div",
          { className: "footer-section" },
          this.createElement("h6", {}, "المنتج"),
          this.createElement(
            "ul",
            { className: "footer-links" },
            this.createElement(
              "li",
              {},
              this.createElement(
                "a",
                {
                  className: "footer-link",
                  onClick: () => router.navigate("demo"),
                },
                "التجربة"
              )
            ),
            this.createElement(
              "li",
              {},
              this.createElement("a", { className: "footer-link" }, "الأسعار")
            ),
            this.createElement(
              "li",
              {},
              this.createElement("a", { className: "footer-link" }, "الميزات")
            )
          )
        ),
        this.createElement(
          "div",
          { className: "footer-section" },
          this.createElement("h6", {}, "الموارد"),
          this.createElement(
            "ul",
            { className: "footer-links" },
            this.createElement(
              "li",
              {},
              this.createElement("a", { className: "footer-link" }, "المدونة")
            ),
            this.createElement(
              "li",
              {},
              this.createElement("a", { className: "footer-link" }, "الدروس")
            ),
            this.createElement(
              "li",
              {},
              this.createElement("a", { className: "footer-link" }, "الدعم")
            )
          )
        ),
        this.createElement(
          "div",
          { className: "footer-section" },
          this.createElement("h6", {}, "تواصل معنا"),
          this.createElement(
            "p",
            { className: "text-secondary" },
            "© 2025 ActorAI Pro"
          )
        )
      )
    );
  }
}

// ==================== HOMEPAGE ====================

class HomePage extends Component {
  render() {
    const navbar = new Navbar();
    const hero = new HeroSection();
    const features = new FeaturesSection();
    const howItWorks = new HowItWorksSection();
    const footer = new Footer();

    return this.createElement(
      "div",
      {},
      navbar.render(),
      hero.render(),
      features.render(),
      howItWorks.render(),
      footer.render()
    );
  }
}

// ==================== DEMO PAGE ====================

class DemoPage extends Component {
  constructor() {
    super();
    this.state = {
      activeTab: "analysis",
      analyzing: false,
      analysisResults: null,
      selectedMethodology: "stanislavsky",
      rehearsing: false,
      messages: [],
      scriptText: "",
    };
  }

  useSampleScript() {
    this.state.scriptText = appState.getSampleScript();
    this.update();
  }

  analyzeScript() {
    this.state.analyzing = true;
    this.update();

    setTimeout(() => {
      this.state.analyzing = false;
      this.state.analysisResults = this.getSampleAnalysis();
      this.update();
    }, 2000);
  }

  getSampleAnalysis() {
    return {
      objectives: {
        main: "أن يكون مع جولييت ويتغلب على عقبات العائلة",
        scene: "الإعلان عن الحب وتقييم مشاعر جولييت",
        beats: [
          "مراقبة جولييت من بعيد",
          "الكشف عن الحضور",
          "التعبير عن الحب شعرياً",
        ],
      },
      obstacles: {
        internal: ["الخوف من الرفض", "القلق من اكتشاف العائلة"],
        external: [
          "المسافة الجسدية (الشرفة)",
          "عداء العائلتين",
          "خطر الوقوع في الأسر",
        ],
      },
      emotionalArc: [
        { beat: 1, emotion: "الشوق", intensity: 70 },
        { beat: 2, emotion: "العجب", intensity: 85 },
        { beat: 3, emotion: "الحب", intensity: 95 },
      ],
      coachingTips: [
        "ركّز على الصور البصرية - انظر حقاً إلى جولييت كأنها الشمس",
        "اسمح بلحظات صمت للتنفس والتفكير",
        "أوجد التوازن بين العاطفة والضعف",
        "استخدم لغة راقية دون فقدان الأصالة",
      ],
    };
  }

  startRehearsal() {
    this.state.rehearsing = true;
    this.state.messages = [
      {
        role: "user",
        text: "But soft, what light through yonder window breaks? It is the east, and Juliet is the sun.",
      },
    ];
    this.update();

    setTimeout(() => {
      this.state.messages.push({
        role: "ai",
        text: "O Romeo, Romeo, wherefore art thou Romeo? Deny thy father and refuse thy name.",
        typing: true,
      });
      this.update();

      setTimeout(() => {
        this.state.messages[this.state.messages.length - 1].typing = false;
        this.update();

        setTimeout(() => {
          this.state.messages.push({
            role: "user",
            text: "Shall I hear more, or shall I speak at this?",
          });
          this.update();
        }, 1500);
      }, 1000);
    }, 1500);
  }

  update() {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(this.render());
  }

  renderAnalysisTab() {
    const methodologies = [
      { id: "stanislavsky", name: "منهجية ستانيسلافسكي" },
      { id: "meisner", name: "تقنية مايسنر" },
      { id: "chekhov", name: "تقنية مايكل تشيخوف" },
      { id: "hagen", name: "أوتا هاجن" },
      { id: "practical_aesthetics", name: "الجماليات العملية" },
    ];

    return this.createElement(
      "div",
      { className: "fade-in" },
      this.createElement(
        "div",
        { className: "card mb-6" },
        this.createElement("h4", { className: "mb-4" }, "رفع النص"),
        this.state.scriptText
          ? this.createElement(
              "div",
              {
                className: "mb-4",
                style: {
                  padding: "1rem",
                  background: "var(--background)",
                  borderRadius: "8px",
                },
              },
              this.createElement(
                "pre",
                { style: { whiteSpace: "pre-wrap", fontSize: "14px" } },
                this.state.scriptText
              )
            )
          : this.createElement(
              "div",
              {
                className: "file-upload mb-4",
                onClick: () => this.useSampleScript(),
              },
              this.createElement(
                "div",
                { style: { fontSize: "40px", marginBottom: "1rem" } },
                "📄"
              ),
              this.createElement("p", {}, "اضغط لاستخدام نص تجريبي"),
              this.createElement(
                "p",
                { className: "text-secondary", style: { fontSize: "12px" } },
                "أو اسحب وأفلت النص هنا"
              )
            ),
        this.createElement(
          "div",
          { className: "mb-4" },
          this.createElement(
            "label",
            {
              className: "mb-2",
              style: { display: "block", fontWeight: "500" },
            },
            "منهجية التمثيل"
          ),
          this.createElement(
            "select",
            {
              className: "select",
              value: this.state.selectedMethodology,
              onChange: (e) => {
                this.state.selectedMethodology = e.target.value;
              },
            },
            methodologies.map((m) =>
              this.createElement("option", { value: m.id }, m.name)
            )
          )
        ),
        this.createElement(
          "div",
          { className: "mb-4" },
          this.createElement(
            "label",
            {
              className: "mb-2",
              style: { display: "block", fontWeight: "500" },
            },
            "اسم الشخصية"
          ),
          this.createElement("input", {
            className: "input",
            type: "text",
            placeholder: "مثلاً: روميو",
            value: "روميو",
          })
        ),
        this.createElement(
          "button",
          {
            className: "btn btn-primary",
            onClick: () => this.analyzeScript(),
            disabled: this.state.analyzing || !this.state.scriptText,
          },
          this.state.analyzing ? "جارِ التحليل..." : "🔍 تحليل النص"
        )
      ),
      this.state.analyzing &&
        this.createElement(
          "div",
          { className: "text-center" },
          this.createElement("div", { className: "loading-spinner" })
        ),
      this.state.analysisResults &&
        this.createElement(
          "div",
          { className: "slide-up" },
          this.createElement(
            "div",
            { className: "card mb-4" },
            this.createElement(
              "h4",
              { className: "mb-4 text-primary" },
              "🎯 الأهداف"
            ),
            this.createElement(
              "div",
              { className: "mb-4" },
              this.createElement("strong", {}, "الهدف الرئيسي: "),
              this.createElement(
                "span",
                {},
                this.state.analysisResults.objectives.main
              )
            ),
            this.createElement(
              "div",
              { className: "mb-4" },
              this.createElement("strong", {}, "هدف المشهد: "),
              this.createElement(
                "span",
                {},
                this.state.analysisResults.objectives.scene
              )
            ),
            this.createElement(
              "div",
              {},
              this.createElement("strong", {}, "أهداف الإيقاعات:"),
              this.createElement(
                "ul",
                { style: { marginTop: "0.5rem", paddingLeft: "1.5rem" } },
                this.state.analysisResults.objectives.beats.map((beat) =>
                  this.createElement("li", {}, beat)
                )
              )
            )
          ),
          this.createElement(
            "div",
            { className: "card mb-4" },
            this.createElement(
              "h4",
              { className: "mb-4 text-primary" },
              "🚧 العقبات"
            ),
            this.createElement(
              "div",
              { className: "mb-4" },
              this.createElement("strong", {}, "داخلية:"),
              this.createElement(
                "ul",
                { style: { marginTop: "0.5rem", paddingLeft: "1.5rem" } },
                this.state.analysisResults.obstacles.internal.map((obs) =>
                  this.createElement("li", {}, obs)
                )
              )
            ),
            this.createElement(
              "div",
              {},
              this.createElement("strong", {}, "خارجية:"),
              this.createElement(
                "ul",
                { style: { marginTop: "0.5rem", paddingLeft: "1.5rem" } },
                this.state.analysisResults.obstacles.external.map((obs) =>
                  this.createElement("li", {}, obs)
                )
              )
            )
          ),
          this.createElement(
            "div",
            { className: "card mb-4" },
            this.createElement(
              "h4",
              { className: "mb-4 text-primary" },
              "💭 القوس العاطفي"
            ),
            this.createElement(
              "div",
              {
                style: { display: "flex", gap: "1rem", alignItems: "flex-end" },
              },
              this.state.analysisResults.emotionalArc.map((arc) =>
                this.createElement(
                  "div",
                  { style: { flex: 1, textAlign: "center" } },
                  this.createElement("div", {
                    style: {
                      height: `${arc.intensity * 2}px`,
                      background:
                        "linear-gradient(to top, var(--primary), var(--secondary))",
                      borderRadius: "4px 4px 0 0",
                      marginBottom: "0.5rem",
                      transition: "height 0.5s ease",
                    },
                  }),
                  this.createElement(
                    "div",
                    { style: { fontSize: "12px", fontWeight: "600" } },
                    arc.emotion
                  ),
                  this.createElement(
                    "div",
                    {
                      className: "text-secondary",
                      style: { fontSize: "11px" },
                    },
                    `${arc.intensity}%`
                  )
                )
              )
            )
          ),
          this.createElement(
            "div",
            { className: "card" },
            this.createElement(
              "h4",
              { className: "mb-4 text-primary" },
              "💡 نصائح التدريب"
            ),
            this.createElement(
              "ul",
              { style: { paddingLeft: "1.5rem" } },
              this.state.analysisResults.coachingTips.map((tip) =>
                this.createElement("li", { className: "mb-2" }, tip)
              )
            )
          )
        )
    );
  }

  renderScenePartnerTab() {
    return this.createElement(
      "div",
      { className: "fade-in" },
      this.createElement(
        "div",
        { className: "card mb-6" },
        this.createElement("h4", { className: "mb-4" }, "إعداد المشهد"),
        this.createElement(
          "div",
          { className: "grid grid-2 mb-4" },
          this.createElement(
            "div",
            {},
            this.createElement(
              "label",
              {
                className: "mb-2",
                style: { display: "block", fontWeight: "500" },
              },
              "شخصيتك"
            ),
            this.createElement(
              "select",
              { className: "select" },
              this.createElement("option", {}, "روميو"),
              this.createElement("option", {}, "جولييت")
            )
          ),
          this.createElement(
            "div",
            {},
            this.createElement(
              "label",
              {
                className: "mb-2",
                style: { display: "block", fontWeight: "500" },
              },
              "صوت الذكاء الاصطناعي"
            ),
            this.createElement(
              "select",
              { className: "select" },
              this.createElement("option", {}, "أنثى - طبيعي"),
              this.createElement("option", {}, "أنثى - درامي"),
              this.createElement("option", {}, "ذكر - طبيعي")
            )
          )
        ),
        this.createElement(
          "div",
          { className: "mb-4" },
          this.createElement(
            "label",
            {
              className: "mb-2",
              style: { display: "block", fontWeight: "500" },
            },
            "العاطفة"
          ),
          this.createElement(
            "select",
            { className: "select" },
            this.createElement("option", {}, "شوق"),
            this.createElement("option", {}, "فرح"),
            this.createElement("option", {}, "غضب"),
            this.createElement("option", {}, "حزن")
          )
        ),
        this.createElement(
          "div",
          { className: "mb-4" },
          this.createElement(
            "label",
            {
              className: "mb-2",
              style: { display: "block", fontWeight: "500" },
            },
            `معدل الكلام: عادي`
          ),
          this.createElement("input", {
            className: "slider",
            type: "range",
            min: "0",
            max: "100",
            value: "50",
          })
        ),
        this.createElement(
          "button",
          {
            className: "btn btn-primary",
            onClick: () => this.startRehearsal(),
            disabled: this.state.rehearsing,
          },
          this.state.rehearsing ? "🎭 جارِ التدريب..." : "🎭 ابدأ التدريب"
        )
      ),
      this.state.rehearsing &&
        this.createElement(
          "div",
          { className: "card" },
          this.createElement("h4", { className: "mb-4" }, "التدريب"),
          this.createElement(
            "div",
            { className: "chat-container" },
            this.state.messages.map((msg) =>
              this.createElement(
                "div",
                { className: `chat-message ${msg.role}` },
                this.createElement(
                  "div",
                  { className: `chat-bubble ${msg.role}` },
                  msg.typing
                    ? this.createElement(
                        "div",
                        { className: "typing-indicator" },
                        this.createElement("div", { className: "typing-dot" }),
                        this.createElement("div", { className: "typing-dot" }),
                        this.createElement("div", { className: "typing-dot" })
                      )
                    : msg.text
                )
              )
            )
          )
        )
    );
  }

  renderPerformanceTab() {
    const metrics = {
      overall: 82,
      emotional: { consistency: 78, authenticity: 85 },
      vocal: { clarity: 87, pitchRange: "جيد", speechRate: 145 },
      strengths: [
        "إسقاط صوتي قوي ووضوح ممتاز",
        "اتصال عاطفي أصيل مع المادة",
        "استخدام جيد للتوقفات لخلق التأثير الدرامي",
      ],
      improvements: [
        "زيادة التواصل البصري مع الكاميرا/الجمهور",
        "إضافة المزيد من الحركات الجسدية لدعم النص",
        "العمل على التنوع الصوتي في النبرة",
      ],
    };

    return this.createElement(
      "div",
      { className: "fade-in" },
      this.createElement(
        "div",
        { className: "card mb-6" },
        this.createElement("h4", { className: "mb-4" }, "نموذج الأداء"),
        this.createElement(
          "div",
          { className: "video-placeholder" },
          this.createElement(
            "div",
            {},
            this.createElement(
              "div",
              { style: { fontSize: "48px", marginBottom: "1rem" } },
              "🎬"
            ),
            this.createElement("div", {}, "فيديو الأداء")
          )
        )
      ),
      this.createElement(
        "div",
        { className: "grid grid-2 mb-6" },
        this.createElement(
          "div",
          { className: "card text-center" },
          this.createElement(
            "div",
            { className: "progress-circular", style: { margin: "0 auto" } },
            this.createElement(
              "svg",
              { width: "120", height: "120", viewBox: "0 0 120 120" },
              this.createElement("circle", {
                cx: "60",
                cy: "60",
                r: "54",
                fill: "none",
                stroke: "rgba(139, 92, 246, 0.1)",
                "stroke-width": "12",
              }),
              this.createElement("circle", {
                cx: "60",
                cy: "60",
                r: "54",
                fill: "none",
                stroke: "var(--primary)",
                "stroke-width": "12",
                "stroke-dasharray": `${metrics.overall * 3.39} 339.292`,
                "stroke-linecap": "round",
                transform: "rotate(-90 60 60)",
              })
            ),
            this.createElement(
              "div",
              { className: "progress-text" },
              metrics.overall
            )
          ),
          this.createElement("h5", { className: "mt-4" }, "النتيجة الإجمالية")
        ),
        this.createElement(
          "div",
          { className: "card" },
          this.createElement("h5", { className: "mb-4" }, "المقاييس الرئيسية"),
          this.createElement(
            "div",
            { className: "mb-3" },
            this.createElement(
              "div",
              { className: "flex justify-between mb-2" },
              this.createElement("span", {}, "الاتساق العاطفي"),
              this.createElement(
                "span",
                { className: "font-bold" },
                `${metrics.emotional.consistency}%`
              )
            ),
            this.createElement(
              "div",
              { className: "progress-bar" },
              this.createElement("div", {
                className: "progress-fill",
                style: { width: `${metrics.emotional.consistency}%` },
              })
            )
          ),
          this.createElement(
            "div",
            { className: "mb-3" },
            this.createElement(
              "div",
              { className: "flex justify-between mb-2" },
              this.createElement("span", {}, "الأصالة"),
              this.createElement(
                "span",
                { className: "font-bold" },
                `${metrics.emotional.authenticity}%`
              )
            ),
            this.createElement(
              "div",
              { className: "progress-bar" },
              this.createElement("div", {
                className: "progress-fill",
                style: { width: `${metrics.emotional.authenticity}%` },
              })
            )
          ),
          this.createElement(
            "div",
            {},
            this.createElement(
              "div",
              { className: "flex justify-between mb-2" },
              this.createElement("span", {}, "الوضوح الصوتي"),
              this.createElement(
                "span",
                { className: "font-bold" },
                `${metrics.vocal.clarity}%`
              )
            ),
            this.createElement(
              "div",
              { className: "progress-bar" },
              this.createElement("div", {
                className: "progress-fill",
                style: { width: `${metrics.vocal.clarity}%` },
              })
            )
          )
        )
      ),
      this.createElement(
        "div",
        { className: "grid grid-2 mb-6" },
        this.createElement(
          "div",
          { className: "card" },
          this.createElement("h5", { className: "mb-4" }, "✅ نقاط القوة"),
          this.createElement(
            "ul",
            { style: { paddingLeft: "1.5rem" } },
            metrics.strengths.map((s) =>
              this.createElement("li", { className: "mb-2" }, s)
            )
          )
        ),
        this.createElement(
          "div",
          { className: "card" },
          this.createElement(
            "h5",
            { className: "mb-4" },
            "💪 مجالات التحسين"
          ),
          this.createElement(
            "ul",
            { style: { paddingLeft: "1.5rem" } },
            metrics.improvements.map((i) =>
              this.createElement("li", { className: "mb-2" }, i)
            )
          )
        )
      ),
      this.createElement(
        "div",
        { className: "card" },
        this.createElement(
          "h5",
          { className: "mb-4" },
          "🎓 ملاحظات المدرب الذكي"
        ),
        this.createElement(
          "p",
          { className: "text-secondary" },
          "بشكل عام، هذا أداء قوي مع وضوح صوتي ممتاز واتصال عاطفي أصيل. استخدامك للتوقفات فعّال بشكل خاص في خلق التوتر الدرامي. للارتقاء بهذا الأداء إلى المستوى التالي، ركّز على زيادة مشاركتك الجسدية مع المساحة والحفاظ على تواصل بصري أكثر اتساقاً."
        )
      )
    );
  }

  render() {
    const navbar = new Navbar();

    return this.createElement(
      "div",
      {},
      navbar.render(),
      this.createElement(
        "div",
        { className: "container", style: { padding: "2rem 1.5rem" } },
        this.createElement("h2", { className: "mb-8" }, "التجربة التفاعلية"),
        this.createElement(
          "div",
          { className: "tabs" },
          this.createElement(
            "button",
            {
              className: `tab ${this.state.activeTab === "analysis" ? "active" : ""}`,
              onClick: () => {
                this.state.activeTab = "analysis";
                this.update();
              },
            },
            "🧠 تحليل النصوص"
          ),
          this.createElement(
            "button",
            {
              className: `tab ${this.state.activeTab === "partner" ? "active" : ""}`,
              onClick: () => {
                this.state.activeTab = "partner";
                this.update();
              },
            },
            "💬 شريك المشهد الذكي"
          ),
          this.createElement(
            "button",
            {
              className: `tab ${this.state.activeTab === "performance" ? "active" : ""}`,
              onClick: () => {
                this.state.activeTab = "performance";
                this.update();
              },
            },
            "📊 تحليل الأداء"
          )
        ),
        this.state.activeTab === "analysis"
          ? this.renderAnalysisTab()
          : this.state.activeTab === "partner"
            ? this.renderScenePartnerTab()
            : this.renderPerformanceTab()
      ),
      new Footer().render()
    );
  }
}

// ==================== LOGIN PAGE ====================

class LoginPage extends Component {
  handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    appState.login(email, password);
  }

  render() {
    const navbar = new Navbar();

    return this.createElement(
      "div",
      {},
      navbar.render(),
      this.createElement(
        "div",
        {
          style: {
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          },
        },
        this.createElement(
          "div",
          {
            className: "card fade-in",
            style: { maxWidth: "400px", width: "100%" },
          },
          this.createElement(
            "div",
            { className: "text-center mb-6" },
            this.createElement(
              "div",
              { style: { fontSize: "48px", marginBottom: "1rem" } },
              "🎭"
            ),
            this.createElement("h3", { className: "mb-2" }, "مرحباً بعودتك"),
            this.createElement(
              "p",
              { className: "text-secondary" },
              "سجّل الدخول لمتابعة تدريبك"
            )
          ),
          this.createElement(
            "form",
            {
              onSubmit: (e) => this.handleLogin(e),
            },
            this.createElement(
              "div",
              { className: "mb-4" },
              this.createElement(
                "label",
                {
                  className: "mb-2",
                  style: { display: "block", fontWeight: "500" },
                },
                "البريد الإلكتروني"
              ),
              this.createElement("input", {
                className: "input",
                type: "email",
                name: "email",
                placeholder: "your@email.com",
                required: true,
              })
            ),
            this.createElement(
              "div",
              { className: "mb-4" },
              this.createElement(
                "label",
                {
                  className: "mb-2",
                  style: { display: "block", fontWeight: "500" },
                },
                "كلمة المرور"
              ),
              this.createElement("input", {
                className: "input",
                type: "password",
                name: "password",
                placeholder: "••••••••",
                required: true,
              })
            ),
            this.createElement(
              "div",
              { className: "flex justify-between items-center mb-6" },
              this.createElement(
                "label",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  },
                },
                this.createElement("input", { type: "checkbox" }),
                this.createElement(
                  "span",
                  { style: { fontSize: "14px" } },
                  "تذكرني"
                )
              ),
              this.createElement(
                "a",
                {
                  style: {
                    fontSize: "14px",
                    color: "var(--primary)",
                    cursor: "pointer",
                  },
                },
                "نسيت كلمة المرور؟"
              )
            ),
            this.createElement(
              "button",
              {
                className: "btn btn-primary w-full mb-4",
                type: "submit",
              },
              "تسجيل الدخول"
            ),
            this.createElement(
              "div",
              { className: "text-center" },
              this.createElement(
                "span",
                { className: "text-secondary", style: { fontSize: "14px" } },
                "ليس لديك حساب؟ "
              ),
              this.createElement(
                "a",
                {
                  style: { color: "var(--primary)", cursor: "pointer" },
                  onClick: () => router.navigate("register"),
                },
                "سجّل الآن"
              )
            )
          )
        )
      )
    );
  }
}

// ==================== REGISTER PAGE ====================

class RegisterPage extends Component {
  handleRegister(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const _password = e.target.password.value;
    appState.register(name, email, _password);
  }

  render() {
    const navbar = new Navbar();

    return this.createElement(
      "div",
      {},
      navbar.render(),
      this.createElement(
        "div",
        {
          style: {
            minHeight: "80vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          },
        },
        this.createElement(
          "div",
          {
            className: "card fade-in",
            style: { maxWidth: "400px", width: "100%" },
          },
          this.createElement(
            "div",
            { className: "text-center mb-6" },
            this.createElement(
              "div",
              { style: { fontSize: "48px", marginBottom: "1rem" } },
              "🎭"
            ),
            this.createElement("h3", { className: "mb-2" }, "إنشاء حساب"),
            this.createElement(
              "p",
              { className: "text-secondary" },
              "ابدأ رحلتك التمثيلية مع الذكاء الاصطناعي"
            )
          ),
          this.createElement(
            "form",
            {
              onSubmit: (e) => this.handleRegister(e),
            },
            this.createElement(
              "div",
              { className: "mb-4" },
              this.createElement(
                "label",
                {
                  className: "mb-2",
                  style: { display: "block", fontWeight: "500" },
                },
                "الاسم"
              ),
              this.createElement("input", {
                className: "input",
                type: "text",
                name: "name",
                placeholder: "اسمك",
                required: true,
              })
            ),
            this.createElement(
              "div",
              { className: "mb-4" },
              this.createElement(
                "label",
                {
                  className: "mb-2",
                  style: { display: "block", fontWeight: "500" },
                },
                "البريد الإلكتروني"
              ),
              this.createElement("input", {
                className: "input",
                type: "email",
                name: "email",
                placeholder: "your@email.com",
                required: true,
              })
            ),
            this.createElement(
              "div",
              { className: "mb-4" },
              this.createElement(
                "label",
                {
                  className: "mb-2",
                  style: { display: "block", fontWeight: "500" },
                },
                "كلمة المرور"
              ),
              this.createElement("input", {
                className: "input",
                type: "password",
                name: "password",
                placeholder: "••••••••",
                required: true,
              })
            ),
            this.createElement(
              "div",
              { className: "mb-6" },
              this.createElement(
                "label",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  },
                },
                this.createElement("input", {
                  type: "checkbox",
                  required: true,
                }),
                this.createElement(
                  "span",
                  { style: { fontSize: "14px" } },
                  "أوافق على الشروط والأحكام"
                )
              )
            ),
            this.createElement(
              "button",
              {
                className: "btn btn-primary w-full mb-4",
                type: "submit",
              },
              "إنشاء حساب"
            ),
            this.createElement(
              "div",
              { className: "text-center" },
              this.createElement(
                "span",
                { className: "text-secondary", style: { fontSize: "14px" } },
                "لديك حساب بالفعل؟ "
              ),
              this.createElement(
                "a",
                {
                  style: { color: "var(--primary)", cursor: "pointer" },
                  onClick: () => router.navigate("login"),
                },
                "سجّل الدخول"
              )
            )
          )
        )
      )
    );
  }
}

// ==================== SIDEBAR COMPONENT ====================

class Sidebar extends Component {
  render() {
    const { currentPage, user } = appState;
    const menuItems = [
      { id: "dashboard", icon: "🏠", label: "لوحة التحكم" },
      { id: "scripts", icon: "📜", label: "النصوص" },
      { id: "rehearsal", icon: "🎭", label: "استوديو التدريب" },
      { id: "recordings", icon: "🎬", label: "التسجيلات" },
      { id: "analytics", icon: "📊", label: "التحليلات" },
    ];

    return this.createElement(
      "aside",
      { className: "sidebar" },
      this.createElement(
        "div",
        { className: "navbar-logo", style: { marginBottom: "2rem" } },
        this.createElement("span", {}, "🎭"),
        this.createElement("span", {}, "ActorAI Pro")
      ),
      user &&
        this.createElement(
          "div",
          {
            className: "mb-6",
            style: {
              padding: "1rem",
              background: "var(--background)",
              borderRadius: "8px",
            },
          },
          this.createElement(
            "div",
            { style: { fontWeight: "600", marginBottom: "0.25rem" } },
            user.name
          ),
          this.createElement(
            "div",
            { className: "text-secondary", style: { fontSize: "12px" } },
            user.email
          )
        ),
      this.createElement(
        "ul",
        { className: "sidebar-menu" },
        menuItems.map((item) =>
          this.createElement(
            "li",
            { className: "sidebar-item" },
            this.createElement(
              "a",
              {
                className: `sidebar-link ${currentPage === item.id ? "active" : ""}`,
                onClick: () => router.navigate(item.id),
              },
              this.createElement("span", {}, item.icon),
              this.createElement("span", {}, item.label)
            )
          )
        )
      )
    );
  }
}

// ==================== DASHBOARD PAGE ====================

class DashboardPage extends Component {
  render() {
    const sidebar = new Sidebar();
    const stats = [
      {
        label: "مجموع النصوص",
        value: "12",
        icon: "📜",
        color: "var(--primary)",
      },
      {
        label: "التدريبات",
        value: "47",
        icon: "🎭",
        color: "var(--ai-color)",
      },
      {
        label: "التسجيلات",
        value: "28",
        icon: "🎬",
        color: "var(--secondary)",
      },
      { label: "متوسط النتيجة", value: "79", icon: "⭐", color: "var(--primary)" },
    ];

    const recentActivity = [
      {
        type: "analysis",
        title: 'اكتمل التحليل لـ "هاملت - أكون أو لا أكون"',
        time: "منذ ساعتين",
        icon: "🧠",
      },
      {
        type: "rehearsal",
        title: 'تم التدرب على المشهد 3 من "عربة اسمها الرغبة"',
        time: "منذ 5 ساعات",
        icon: "🎭",
      },
      {
        type: "recording",
        title: 'تم حفظ المحاولة 3 من "موت بائع متجول"',
        time: "منذ يوم",
        icon: "🎬",
      },
      {
        type: "upload",
        title: 'تم رفع نص "حديقة الحيوانات الزجاجية"',
        time: "منذ يومين",
        icon: "📤",
      },
    ];

    return this.createElement(
      "div",
      { className: "dashboard-layout" },
      sidebar.render(),
      this.createElement(
        "main",
        { className: "dashboard-main" },
        this.createElement(
          "div",
          { className: "fade-in" },
          this.createElement(
            "h2",
            { className: "mb-8" },
            `Welcome back, ${appState.user.name}! 👋`
          ),
          this.createElement(
            "div",
            { className: "grid grid-4 mb-8" },
            stats.map((stat, index) =>
              this.createElement(
                "div",
                {
                  className: "stat-card slide-up",
                  style: { animationDelay: `${index * 100}ms` },
                },
                this.createElement(
                  "div",
                  { style: { fontSize: "32px", marginBottom: "0.5rem" } },
                  stat.icon
                ),
                this.createElement(
                  "div",
                  { className: "stat-value" },
                  stat.value
                ),
                this.createElement(
                  "div",
                  { className: "stat-label" },
                  stat.label
                )
              )
            )
          ),
          this.createElement(
            "div",
            { className: "grid grid-2 mb-8" },
            this.createElement(
              "div",
              { className: "card" },
              this.createElement(
                "h4",
                { className: "mb-6" },
                "النشاط الأخير"
              ),
              this.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  },
                },
                recentActivity.map((activity) =>
                  this.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        gap: "1rem",
                        padding: "0.75rem",
                        background: "var(--background)",
                        borderRadius: "8px",
                      },
                    },
                    this.createElement(
                      "div",
                      { style: { fontSize: "24px" } },
                      activity.icon
                    ),
                    this.createElement(
                      "div",
                      { style: { flex: 1 } },
                      this.createElement(
                        "div",
                        {
                          style: { fontWeight: "500", marginBottom: "0.25rem" },
                        },
                        activity.title
                      ),
                      this.createElement(
                        "div",
                        {
                          className: "text-secondary",
                          style: { fontSize: "12px" },
                        },
                        activity.time
                      )
                    )
                  )
                )
              )
            ),
            this.createElement(
              "div",
              { className: "card" },
              this.createElement("h4", { className: "mb-6" }, "إجراءات سريعة"),
              this.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  },
                },
                this.createElement(
                  "button",
                  {
                    className: "btn btn-primary w-full",
                    onClick: () => router.navigate("scripts"),
                  },
                  "📤 رفع نص"
                ),
                this.createElement(
                  "button",
                  {
                    className: "btn btn-outline w-full",
                    onClick: () => router.navigate("rehearsal"),
                  },
                  "🎭 ابدأ التدريب"
                ),
                this.createElement(
                  "button",
                  {
                    className: "btn btn-outline w-full",
                    onClick: () => router.navigate("analytics"),
                  },
                  "📊 عرض التحليلات"
                )
              )
            )
          ),
          this.createElement(
            "div",
            { className: "card" },
            this.createElement(
              "h4",
              { className: "mb-6" },
              "اتجاه الأداء"
            ),
            this.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "0.5rem",
                  height: "200px",
                },
              },
              [75, 78, 76, 82, 80, 85, 83, 87, 85, 89, 91, 88].map((score, i) =>
                this.createElement("div", {
                  style: {
                    flex: 1,
                    height: `${score}%`,
                    background:
                      "linear-gradient(to top, var(--primary), var(--secondary))",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.5s ease",
                    animationDelay: `${i * 50}ms`,
                  },
                  className: "slide-up",
                })
              )
            )
          )
        )
      )
    );
  }
}

// ==================== SCRIPTS PAGE ====================

class ScriptsPage extends Component {
  render() {
    const sidebar = new Sidebar();

    return this.createElement(
      "div",
      { className: "dashboard-layout" },
      sidebar.render(),
      this.createElement(
        "main",
        { className: "dashboard-main" },
        this.createElement(
          "div",
          { className: "fade-in" },
          this.createElement(
            "div",
            { className: "flex justify-between items-center mb-8" },
            this.createElement("h2", {}, "نصوصي"),
            this.createElement(
              "button",
              { className: "btn btn-primary" },
              "📤 رفع نص"
            )
          ),
          this.createElement(
            "div",
            { className: "grid grid-3" },
            appState.scripts.map((script, index) =>
              this.createElement(
                "div",
                {
                  className: "card slide-up",
                  style: { animationDelay: `${index * 100}ms` },
                },
                this.createElement("h5", { className: "mb-2" }, script.title),
                this.createElement(
                  "div",
                  {
                    className: "text-secondary mb-4",
                    style: { fontSize: "14px" },
                  },
                  `by ${script.author}`
                ),
                this.createElement(
                  "div",
                  { className: "flex gap-2 mb-4" },
                  this.createElement(
                    "span",
                    {
                      className: `badge badge-${script.status === "analyzed" ? "success" : "warning"}`,
                    },
                    script.status
                  )
                ),
                this.createElement(
                  "div",
                  {
                    className: "text-secondary mb-4",
                    style: { fontSize: "12px" },
                  },
                  `Uploaded ${script.uploadDate}`
                ),
                this.createElement(
                  "div",
                  { className: "flex gap-2" },
                  this.createElement(
                    "button",
                    {
                      className: "btn btn-primary btn-sm",
                      onClick: () => router.navigate("script-analysis"),
                    },
                    "Analyze"
                  ),
                  this.createElement(
                    "button",
                    { className: "btn btn-outline btn-sm" },
                    "View"
                  )
                )
              )
            )
          )
        )
      )
    );
  }
}

// ==================== SCRIPT ANALYSIS PAGE ====================

class ScriptAnalysisPage extends Component {
  render() {
    const sidebar = new Sidebar();

    return this.createElement(
      "div",
      { className: "dashboard-layout" },
      sidebar.render(),
      this.createElement(
        "main",
        { className: "dashboard-main" },
        this.createElement(
          "div",
          { className: "fade-in" },
          this.createElement(
            "button",
            {
              className: "btn btn-ghost mb-4",
              onClick: () => router.navigate("scripts"),
            },
            "← العودة إلى النصوص"
          ),
          this.createElement(
            "h2",
            { className: "mb-8" },
            "Romeo & Juliet - Balcony Scene"
          ),
          this.createElement(
            "div",
            { className: "grid grid-2 mb-6" },
            this.createElement(
              "div",
              {},
              this.createElement(
                "label",
                {
                  className: "mb-2",
                  style: { display: "block", fontWeight: "500" },
                },
                "Acting Methodology"
              ),
              this.createElement(
                "select",
                { className: "select" },
                this.createElement("option", {}, "Stanislavsky Method"),
                this.createElement("option", {}, "Meisner Technique"),
                this.createElement("option", {}, "Michael Chekhov Technique")
              )
            ),
            this.createElement(
              "div",
              {},
              this.createElement(
                "label",
                {
                  className: "mb-2",
                  style: { display: "block", fontWeight: "500" },
                },
                "Character"
              ),
              this.createElement(
                "select",
                { className: "select" },
                this.createElement("option", {}, "Romeo"),
                this.createElement("option", {}, "Juliet")
              )
            )
          ),
          this.createElement(
            "button",
            { className: "btn btn-primary mb-8" },
            "🔍 Generate Analysis"
          ),
          this.createElement(
            "div",
            { className: "card mb-6" },
            this.createElement(
              "h4",
              { className: "mb-4 text-primary" },
              "🎯 Objectives"
            ),
            this.createElement(
              "p",
              {},
              "أن يكون مع جولييت ويتغلب على عقبات العائلة"
            )
          ),
          this.createElement(
            "div",
            { className: "card mb-6" },
            this.createElement(
              "h4",
              { className: "mb-4 text-primary" },
              "🚧 Obstacles"
            ),
            this.createElement(
              "p",
              {},
              "عداء العائلتين، المسافة الجسدية، خطر الاكتشاف"
            )
          ),
          this.createElement(
            "div",
            { className: "card" },
            this.createElement(
              "h4",
              { className: "mb-4 text-primary" },
              "💡 Coaching Tips"
            ),
            this.createElement(
              "p",
              {},
              "ركّز على الصور البصرية - انظر حقاً إلى جولييت كأنها الشمس"
            )
          )
        )
      )
    );
  }
}

// ==================== REHEARSAL PAGE ====================

class RehearsalPage extends Component {
  render() {
    const sidebar = new Sidebar();

    return this.createElement(
      "div",
      { className: "dashboard-layout" },
      sidebar.render(),
      this.createElement(
        "main",
        { className: "dashboard-main" },
        this.createElement(
          "div",
          { className: "fade-in" },
          this.createElement("h2", { className: "mb-8" }, "استوديو التدريب"),
          this.createElement(
            "div",
            { className: "split-layout" },
            this.createElement(
              "div",
              { className: "card" },
              this.createElement("h4", { className: "mb-4" }, "نص المشهد"),
              this.createElement(
                "div",
                {
                  style: {
                    padding: "1rem",
                    background: "var(--background)",
                    borderRadius: "8px",
                  },
                },
                this.createElement(
                  "pre",
                  { style: { whiteSpace: "pre-wrap", fontSize: "14px" } },
                  appState.getSampleScript()
                )
              )
            ),
            this.createElement(
              "div",
              { className: "card" },
              this.createElement("h4", { className: "mb-4" }, "الشريك الذكي"),
              this.createElement(
                "div",
                { className: "mb-4" },
                this.createElement(
                  "select",
                  { className: "select mb-2" },
                  this.createElement("option", {}, "Romeo"),
                  this.createElement("option", {}, "Juliet")
                )
              ),
              this.createElement(
                "div",
                {
                  style: {
                    minHeight: "300px",
                    padding: "1rem",
                    background: "var(--background)",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  },
                },
                this.createElement(
                  "div",
                  { className: "text-secondary text-center" },
                  "اختر المشهد وابدأ التدريب"
                )
              ),
              this.createElement(
                "div",
                { className: "flex gap-2" },
                this.createElement(
                  "button",
                  { className: "btn btn-primary" },
                  "▶️ ابدأ"
                ),
                this.createElement(
                  "button",
                  { className: "btn btn-outline" },
                  "⏸️ إيقاف مؤقت"
                ),
                this.createElement(
                  "button",
                  { className: "btn btn-outline" },
                  "⏹️ إيقاف"
                )
              )
            )
          )
        )
      )
    );
  }
}

// ==================== RECORDINGS PAGE ====================

class RecordingsPage extends Component {
  render() {
    const sidebar = new Sidebar();

    return this.createElement(
      "div",
      { className: "dashboard-layout" },
      sidebar.render(),
      this.createElement(
        "main",
        { className: "dashboard-main" },
        this.createElement(
          "div",
          { className: "fade-in" },
          this.createElement("h2", { className: "mb-8" }, "تسجيلاتي"),
          this.createElement(
            "div",
            { className: "grid grid-3" },
            appState.recordings.map((recording, index) =>
              this.createElement(
                "div",
                {
                  className: "card slide-up",
                  style: { animationDelay: `${index * 100}ms` },
                },
                this.createElement(
                  "div",
                  {
                    className: "video-placeholder mb-4",
                    style: { height: "150px" },
                  },
                  this.createElement(
                    "div",
                    { style: { fontSize: "32px" } },
                    "🎬"
                  )
                ),
                this.createElement(
                  "h5",
                  { className: "mb-2" },
                  recording.title
                ),
                this.createElement(
                  "div",
                  {
                    className: "flex justify-between mb-4",
                    style: { fontSize: "14px" },
                  },
                  this.createElement(
                    "span",
                    { className: "text-secondary" },
                    recording.duration
                  ),
                  this.createElement(
                    "span",
                    { className: "text-primary font-bold" },
                    `Score: ${recording.score}`
                  )
                ),
                this.createElement(
                  "div",
                  {
                    className: "text-secondary mb-4",
                    style: { fontSize: "12px" },
                  },
                  recording.date
                ),
                this.createElement(
                  "div",
                  { className: "flex gap-2" },
                  this.createElement(
                    "button",
                    {
                      className: "btn btn-primary btn-sm",
                      onClick: () => router.navigate("recording-analysis"),
                    },
                    "تحليل"
                  ),
                  this.createElement(
                    "button",
                    { className: "btn btn-outline btn-sm" },
                    "تشغيل"
                  )
                )
              )
            )
          )
        )
      )
    );
  }
}

// ==================== RECORDING ANALYSIS PAGE ====================

class RecordingAnalysisPage extends Component {
  render() {
    const sidebar = new Sidebar();

    return this.createElement(
      "div",
      { className: "dashboard-layout" },
      sidebar.render(),
      this.createElement(
        "main",
        { className: "dashboard-main" },
        this.createElement(
          "div",
          { className: "fade-in" },
          this.createElement(
            "button",
            {
              className: "btn btn-ghost mb-4",
              onClick: () => router.navigate("recordings"),
            },
            "← العودة إلى التسجيلات"
          ),
          this.createElement(
            "h2",
            { className: "mb-8" },
            "تحليل الأداء"
          ),
          this.createElement(
            "div",
            { className: "card mb-6" },
            this.createElement(
              "div",
              { className: "video-placeholder" },
              this.createElement(
                "div",
                {},
                this.createElement(
                  "div",
                  { style: { fontSize: "48px", marginBottom: "1rem" } },
                  "🎬"
                ),
                this.createElement("div", {}, "Recording Playback")
              )
            )
          ),
          this.createElement(
            "div",
            { className: "tabs mb-6" },
            this.createElement(
              "button",
              { className: "tab active" },
              "Overview"
            ),
            this.createElement("button", { className: "tab" }, "Emotional"),
            this.createElement("button", { className: "tab" }, "Vocal"),
            this.createElement("button", { className: "tab" }, "Physical"),
            this.createElement("button", { className: "tab" }, "Coaching")
          ),
          this.createElement(
            "div",
            { className: "grid grid-2 mb-6" },
            this.createElement(
              "div",
              { className: "card text-center" },
              this.createElement("div", { className: "stat-value" }, "82"),
              this.createElement(
                "div",
                { className: "stat-label" },
                "النتيجة الإجمالية"
              )
            ),
            this.createElement(
              "div",
              { className: "card" },
              this.createElement("h5", { className: "mb-4" }, "ملخص سريع"),
              this.createElement(
                "p",
                { className: "text-secondary" },
                "أداء قوي مع وضوح صوتي ممتاز واتصال عاطفي"
              )
            )
          ),
          this.createElement(
            "div",
            { className: "card" },
            this.createElement(
              "h4",
              { className: "mb-4" },
              "💡 التوصيات الرئيسية"
            ),
            this.createElement(
              "ul",
              { style: { paddingLeft: "1.5rem" } },
              this.createElement(
                "li",
                { className: "mb-2" },
                "زيادة التواصل البصري مع الكاميرا/الجمهور"
              ),
              this.createElement(
                "li",
                { className: "mb-2" },
                "إضافة المزيد من الحركات الجسدية لدعم النص"
              ),
              this.createElement("li", {}, "العمل على التنوع الصوتي في النبرة")
            )
          )
        )
      )
    );
  }
}

// ==================== ANALYTICS PAGE ====================

class AnalyticsPage extends Component {
  render() {
    const sidebar = new Sidebar();

    return this.createElement(
      "div",
      { className: "dashboard-layout" },
      sidebar.render(),
      this.createElement(
        "main",
        { className: "dashboard-main" },
        this.createElement(
          "div",
          { className: "fade-in" },
          this.createElement(
            "h2",
            { className: "mb-8" },
            "تحليلات الأداء"
          ),
          this.createElement(
            "div",
            { className: "grid grid-4 mb-8" },
            ["78", "85", "12", "47"].map((stat, i) =>
              this.createElement(
                "div",
                { className: "stat-card" },
                this.createElement("div", { className: "stat-value" }, stat),
                this.createElement(
                  "div",
                  { className: "stat-label" },
                  ["متوسط النتيجة", "أفضل نتيجة", "النصوص", "الجلسات"][i]
                )
              )
            )
          ),
          this.createElement(
            "div",
            { className: "card mb-6" },
            this.createElement(
              "h4",
              { className: "mb-6" },
              "Performance Trend"
            ),
            this.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "0.5rem",
                  height: "250px",
                },
              },
              [72, 75, 73, 78, 76, 82, 79, 84, 81, 86, 83, 85].map((score, i) =>
                this.createElement("div", {
                  style: {
                    flex: 1,
                    height: `${(score / 100) * 100}%`,
                    background:
                      "linear-gradient(to top, var(--primary), var(--ai-color))",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.5s ease",
                  },
                  className: "slide-up",
                })
              )
            )
          ),
          this.createElement(
            "div",
            { className: "grid grid-2" },
            this.createElement(
              "div",
              { className: "card" },
              this.createElement(
                "h4",
                { className: "mb-6" },
                "Practice Time by Week"
              ),
              this.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "0.5rem",
                    height: "200px",
                  },
                },
                [8, 12, 10, 15, 13, 18, 16].map((hours) =>
                  this.createElement("div", {
                    style: {
                      flex: 1,
                      height: `${(hours / 20) * 100}%`,
                      background: "var(--secondary)",
                      borderRadius: "4px 4px 0 0",
                    },
                  })
                )
              )
            ),
            this.createElement(
              "div",
              { className: "card" },
              this.createElement("h4", { className: "mb-6" }, "🎯 رؤى الذكاء الاصطناعي"),
              this.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  },
                },
                this.createElement(
                  "div",
                  {
                    style: {
                      padding: "1rem",
                      background: "var(--background)",
                      borderRadius: "8px",
                    },
                  },
                  this.createElement(
                    "div",
                    { className: "font-bold mb-2" },
                    "📈 اتجاه متحسن"
                  ),
                  this.createElement(
                    "p",
                    {
                      className: "text-secondary",
                      style: { fontSize: "14px" },
                    },
                    "تحسنت نتائجك بنسبة 12% خلال الشهر الماضي"
                  )
                ),
                this.createElement(
                  "div",
                  {
                    style: {
                      padding: "1rem",
                      background: "var(--background)",
                      borderRadius: "8px",
                    },
                  },
                  this.createElement(
                    "div",
                    { className: "font-bold mb-2" },
                    "🎭 مجال القوة"
                  ),
                  this.createElement(
                    "p",
                    {
                      className: "text-secondary",
                      style: { fontSize: "14px" },
                    },
                    "الإلقاء الصوتي هو أقوى مجالاتك"
                  )
                ),
                this.createElement(
                  "div",
                  {
                    style: {
                      padding: "1rem",
                      background: "var(--background)",
                      borderRadius: "8px",
                    },
                  },
                  this.createElement(
                    "div",
                    { className: "font-bold mb-2" },
                    "💪 مجال التركيز"
                  ),
                  this.createElement(
                    "p",
                    {
                      className: "text-secondary",
                      style: { fontSize: "14px" },
                    },
                    "الحضور الجسدي يحتاج إلى مزيد من التدريب"
                  )
                )
              )
            )
          )
        )
      )
    );
  }
}

// ==================== APP COMPONENT ====================

class App {
  constructor() {
    this.init();
  }

  init() {
    appState.subscribe(() => this.render());
    this.render();
  }

  render() {
    const app = document.getElementById("app");
    app.innerHTML = "";

    let page;
    switch (appState.currentPage) {
      case "home":
        page = new HomePage();
        break;
      case "demo":
        page = new DemoPage();
        break;
      case "login":
        page = new LoginPage();
        break;
      case "register":
        page = new RegisterPage();
        break;
      case "dashboard":
        page = new DashboardPage();
        break;
      case "scripts":
        page = new ScriptsPage();
        break;
      case "script-analysis":
        page = new ScriptAnalysisPage();
        break;
      case "rehearsal":
        page = new RehearsalPage();
        break;
      case "recordings":
        page = new RecordingsPage();
        break;
      case "recording-analysis":
        page = new RecordingAnalysisPage();
        break;
      case "analytics":
        page = new AnalyticsPage();
        break;
      default:
        page = new HomePage();
    }

    app.appendChild(page.render());
  }
}

// ==================== INITIALIZE APP ====================

window.addEventListener("DOMContentLoaded", () => {
  new App();
});
