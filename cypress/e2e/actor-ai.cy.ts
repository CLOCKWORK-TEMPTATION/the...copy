/// <reference types="cypress" />

describe('صفحة استوديو الممثل الذكي (Actor AI Arabic)', () => {

    beforeEach(() => {
        // التنصت على طلبات الشبكة قبل تحميل الصفحة
        cy.intercept('GET', '**/static-source/style.css').as('getCSS');
        cy.intercept('GET', '**/static-source/app.js').as('getJS');

        cy.visit('/actorai-arabic');
    });

    it('يجب تحميل الصفحة وعرض النصوص العربية بشكل صحيح', () => {
        // التحقق من العنوان
        cy.contains('h1', 'استوديو الممثل الذكي').should('be.visible');
        // التحقق من الوصف
        cy.contains('p', 'تفاعل مع الممثل الذكي للتدريب على الحوارات والأداء').should('be.visible');
    });

    it('يجب التحقق من وجود الـ Iframe وخصائصه', () => {
        cy.get('iframe[title="Actor AI Arabic Studio"]')
            .should('be.visible')
            .and('have.attr', 'src', '/actorai-arabic/static-source/index.html')
            .and('have.attr', 'allow')
            .and('contain', 'microphone')
            .and('contain', 'camera');
    });

    it('يجب تحميل الملفات الثابتة داخل الـ Iframe بنجاح', () => {
        // انتظار حدوث الطلبات التي تم تعريفها في intercept والتحقق من حالتها
        cy.wait('@getCSS').its('response.statusCode').should('eq', 200);
        cy.wait('@getJS').its('response.statusCode').should('eq', 200);
    });

    it('يجب التحقق من أزرار التحكم (إعادة التحميل وملء الشاشة)', () => {
        // التحقق من زر إعادة التحميل
        cy.get('button[title="إعادة تحميل"]').should('be.visible').click();

        // التأكد من إعادة تحميل الـ Iframe
        cy.get('iframe[title="Actor AI Arabic Studio"]').should('be.visible');

        // التحقق من زر ملء الشاشة
        cy.get('button[title="ملء الشاشة"]').should('be.visible').should('not.be.disabled');
    });

    it('يجب أن تكون الصفحة متجاوبة مع شاشات الجوال', () => {
        // تغيير حجم العرض لمحاكاة iPhone X
        cy.viewport(375, 812);

        // التحقق من أن الحاوية والعنوان لا يزالان ظاهرين
        cy.get('.bg-black').should('be.visible');
        cy.contains('h1', 'استوديو الممثل الذكي').should('be.visible');

        // التحقق من عدم وجود تمرير أفقي (Horizontal Scroll) للحاوية الرئيسية
        cy.window().then((win) => {
            const scrollWidth = win.document.documentElement.scrollWidth;
            const clientWidth = win.document.documentElement.clientWidth;
            // السماح بفرق بسيط جداً في البيكسلات
            expect(scrollWidth).to.be.closeTo(clientWidth, 1);
        });
    });

    it('يجب التحقق من تحميل محتوى الـ Iframe الداخلي', () => {
        // وظيفة مساعدة للوصول إلى محتوى الـ Iframe
        // ملاحظة: هذا يتطلب أن يكون الـ Iframe من نفس الـ Origin (وهو كذلك في بيئة التطوير المحلية)
        cy.get('iframe[title="Actor AI Arabic Studio"]')
            .its('0.contentDocument.body')
            .should('not.be.empty')
            .then(cy.wrap)
            .within(() => {
                // التحقق من العناصر داخل الـ iframe
                cy.get('canvas', { timeout: 10000 }).should('exist'); // عنصر الـ 3D
                cy.get('#ui-layer').should('exist'); // واجهة المستخدم الداخلية
            });
    });
});
