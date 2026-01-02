import React, { useState } from 'react';

const ResidentEligibilityChecker = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState('he'); // 'he' or 'ar'

  const translations = {
    he: {
      title: 'בדיקת מסמכים נדרשים',
      subtitle: 'בדוק אילו מסמכים עליך להגיש לפי מצבך האישי',
      council: 'מועצת משגב - חוסנייה',
      step: 'שלב',
      question: 'שאלה',
      of: 'מתוך',
      completed: 'הושלם',
      startOver: 'התחל מחדש',
      newCheck: 'בדיקה חדשה',
      requiredDocs: 'המסמכים הנדרשים להגשה:',
      submitTo: 'יש להגיש את המסמכים ל:',
      localAuthority: 'הרשות המקומית (מועצת משגב)',
      taxAuthority: 'רשות המסים',
      fillForm: 'מילוי טופס בקשה:',
      important: 'חשוב:',
      taxRefundLimit: 'בקשה להחזר מס ניתן להגיש רק עד 6 שנים אחורה',
      footerNote: 'מערכת זו מבוססת על הנחיות רשות המסים מתאריך 26 באוקטובר 2025.',
      footerContact: 'לשאלות נוספות ניתן לפנות למזכירות המועצה.',
      disclaimer: 'הערה חשובה: מערכת זו הינה כלי עזר לבדיקת המסמכים הנדרשים בלבד ואינה מהווה חוות דעת משפטית. הקביעה הסופית נתונה לשיקול דעתה הבלעדי של הרשות המוסמכת.',
      emailContact: 'פנייה במייל:',
      taxEmail: 'ornara@taxes.gov.il',
      cannotContinue: 'לא ניתן להמשיך',
      questions: {
        isResident: 'האם אתה רשום במרשם התושבים בחוסנייה?',
        livesInHusniyya: 'האם אתה מתגורר בפועל בחוסנייה?',
        maritalStatus: 'מה המצב המשפחתי שלך?',
        spouseInHusniyya: 'האם בן/בת הזוג שלך רשום/ה כתושב/ת חוסנייה וגם מתגורר/ת בחוסנייה?',
        livingArrangement: 'היכן אתה מתגורר?',
        employmentType: 'מה סוג התעסוקה שלך?',
        workLocation: 'היכן מיקום העבודה שלך?',
        hasTravelFromHusniyya: 'האם יש לך אישור נסיעות/הסעה מחוסנייה או החזר נסיעות לצפון?',
        securityBaseType: 'באיזה סוג בסיס אתה משרת?',
        selfEmployedType: 'איפה מתבצעת העבודה העצמאית שלך?',
        hasUtilityPayments: 'האם יש על שמך תשלומים (מים, ארנונה, חשמל)?'
      },
      options: {
        yesResident: 'כן, אני רשום בחוסנייה',
        noResident: 'לא, אני לא רשום בחוסנייה',
        yesLives: 'כן, אני מתגורר בחוסנייה',
        noLives: 'לא, אני לא מתגורר בחוסנייה',
        single: 'רווק/ה',
        married: 'נשוי/אה',
        yesSpouse: 'כן, בן/בת הזוג רשום/ה ומתגורר/ת בחוסנייה',
        noSpouse: 'לא',
        parents: 'בבית ההורים',
        rental: 'ביחידת דיור / דירה שכורה (כולל הכל)',
        owned: 'בדירה בבעלותי',
        employee: 'שכיר',
        selfEmployed: 'עצמאי',
        security: 'איש קבע / כוחות ביטחון',
        nearby: 'בקרבת מקום מגורי (צפון הארץ)',
        haifaSouth: 'בחיפה ודרומה',
        yesTravelApproval: 'כן, יש לי אישור נסיעות/הסעה מחוסנייה או החזר נסיעות',
        noTravelApproval: 'לא, אין לי אישור כזה',
        closedBase: 'בסיס סגור',
        nearbyBase: 'בסיס קרוב למקום מגורי',
        farBase: 'בסיס פתוח רחוק ממקום מגורי',
        physicalBusiness: 'יש לי חנות/משרד/עסק פיזי באזור ואני משלם מיסים עליו',
        homeOnly: 'עובד מהבית בלבד (ללא עסק פיזי)',
        yesPayments: 'כן, יש תשלומים על שמי',
        noPayments: 'לא, אין תשלומים על שמי'
      },
      failMessages: {
        notResident: 'יש להיות רשום במרשם התושבים בחוסנייה',
        notLivingInHusniyya: 'יש להתגורר בפועל בחוסנייה',
        spouseNotInHusniyya: 'בן/בת הזוג חייב/ת להיות רשום/ה ומתגורר/ת בחוסנייה'
      },
      requirements: {
        idWithAppendix: 'תעודת זהות כולל ספח',
        arnonaPayment: 'תשלום ארנונה',
        waterPayment: 'תשלום מים',
        rentPayment: 'תשלום שכירות',
        rentalContract: 'חוזה שכירות',
        employerApproval: 'אישור מעסיק על מיקום עבודה בפועל ותשלום נסיעות',
        travelApproval: 'אישור נסיעות/הסעה מחוסנייה או אישור החזר נסיעות לצפון',
        securityApproval: 'אישור מיחידת השירות על תנאי השירות (בסיס סגור/קרוב למקום מגורים)',
        form1312: 'טופס 1312 מלא',
        rentAssistance: 'אישור על השתתפות בשכ"ד ע"י כוחות הביטחון (אם רלוונטי)',
        businessTax: 'אישור על תשלום מיסים על העסק',
        businessDocs: 'מסמכים המעידים על פעילות העסק באזור (חשבוניות/קבלות/הסכמים)',
        declaration: 'הצהרה מפורטת כולל מספר ת.ז. ופלאפון',
        form1312Copy: 'העתק טופס 1312 שהוגש לרשות המקומית',
        creditCards: 'פירוט כרטיסי אשראי ותדפיסי עו"ש עבור 12 חודשים',
        lifeCenterProof: 'הוכחות למרכז חיים: רב-קו, תדלוקים, ביקורים בקופ"ח, מנוי חדר כושר',
        companyApproval: 'אם עובד מול חברה מסוימת: אישור על אופן ההתקשרות מהבית',
        homeBusinessDocs: 'אם העסק בבית: חשבוניות/קבלות מלקוחות מהאזור',
        rentProofIfNoPayments: 'הוכחת תשלום שכ"ד (אם יש חוזה שכירות ואין תשלומים על שמך)',
        additionalProofs: 'הוכחות נוספות: ביקורים בקופ"ח, פירוט רב-קו, תדלוקים, מנוי חדר כושר'
      }
    },
    ar: {
      title: 'فحص المستندات المطلوبة',
      subtitle: 'تحقق من المستندات التي يجب تقديمها حسب حالتك الشخصية',
      council: 'مجلس مسغاف - الحسينية',
      step: 'مرحلة',
      question: 'سؤال',
      of: 'من',
      completed: 'اكتمل',
      startOver: 'ابدأ من جديد',
      newCheck: 'فحص جديد',
      requiredDocs: 'المستندات المطلوبة للتقديم:',
      submitTo: 'يجب تقديم المستندات إلى:',
      localAuthority: 'السلطة المحلية (مجلس مسغاف)',
      taxAuthority: 'سلطة الضرائب',
      fillForm: 'تعبئة نموذج الطلب:',
      important: 'مهم:',
      taxRefundLimit: 'يمكن تقديم طلب استرداد ضريبة حتى 6 سنوات للخلف فقط',
      footerNote: 'هذا النظام مبني على تعليمات سلطة الضرائب بتاريخ 26 أكتوبر 2025.',
      footerContact: 'لأسئلة إضافية يمكن التوجه لسكرتارية المجلس.',
      disclaimer: 'ملاحظة هامة: هذا النظام هو أداة مساعدة لفحص المستندات المطلوبة فقط ولا يشكل رأياً قانونياً. القرار النهائي يعود للسلطة المختصة حصرياً.',
      emailContact: 'التواصل عبر البريد:',
      taxEmail: 'ornara@taxes.gov.il',
      cannotContinue: 'لا يمكن المتابعة',
      questions: {
        isResident: 'هل أنت مسجل في سجل السكان في الحسينية؟',
        livesInHusniyya: 'هل تسكن فعلياً في الحسينية؟',
        maritalStatus: 'ما هي حالتك الاجتماعية؟',
        spouseInHusniyya: 'هل زوجك/زوجتك مسجل/ة كمقيم/ة في الحسينية ويسكن/تسكن فعلياً في الحسينية؟',
        livingArrangement: 'أين تسكن؟',
        employmentType: 'ما هو نوع عملك؟',
        workLocation: 'أين موقع عملك؟',
        hasTravelFromHusniyya: 'هل لديك تصديق مواصلات/باص من الحسينية أو استرداد مواصلات للشمال؟',
        securityBaseType: 'في أي نوع قاعدة تخدم؟',
        selfEmployedType: 'أين يتم عملك المستقل؟',
        hasUtilityPayments: 'هل هناك دفعات على اسمك (مياه، أرنونا، كهرباء)؟'
      },
      options: {
        yesResident: 'نعم، أنا مسجل في الحسينية',
        noResident: 'لا، لست مسجلاً في الحسينية',
        yesLives: 'نعم، أسكن في الحسينية',
        noLives: 'لا، لا أسكن في الحسينية',
        single: 'أعزب/عزباء',
        married: 'متزوج/ة',
        yesSpouse: 'نعم، الزوج/الزوجة مسجل/ة ويسكن/تسكن في الحسينية',
        noSpouse: 'لا',
        parents: 'في بيت الأهل',
        rental: 'في وحدة سكنية / شقة مستأجرة (شامل الكل)',
        owned: 'في شقة ملكي',
        employee: 'أجير',
        selfEmployed: 'مستقل',
        security: 'جندي نظامي / قوات الأمن',
        nearby: 'قريب من مكان سكني (شمال البلاد)',
        haifaSouth: 'في حيفا وجنوباً',
        yesTravelApproval: 'نعم، لدي تصديق مواصلات/باص من الحسينية أو استرداد مواصلات',
        noTravelApproval: 'لا، ليس لدي تصديق كهذا',
        closedBase: 'قاعدة مغلقة',
        nearbyBase: 'قاعدة قريبة من مكان سكني',
        farBase: 'قاعدة مفتوحة بعيدة عن مكان سكني',
        physicalBusiness: 'لدي محل/مكتب/عمل فعلي في المنطقة وأدفع ضرائب عليه',
        homeOnly: 'أعمل من البيت فقط (بدون عمل فعلي)',
        yesPayments: 'نعم، هناك دفعات على اسمي',
        noPayments: 'لا، لا توجد دفعات على اسمي'
      },
      failMessages: {
        notResident: 'يجب أن تكون مسجلاً في سجل السكان في الحسينية',
        notLivingInHusniyya: 'يجب أن تسكن فعلياً في الحسينية',
        spouseNotInHusniyya: 'يجب أن يكون الزوج/الزوجة مسجل/ة ويسكن/تسكن في الحسينية'
      },
      requirements: {
        idWithAppendix: 'بطاقة هوية مع الملحق',
        arnonaPayment: 'دفعة أرنونا',
        waterPayment: 'دفعة مياه',
        rentPayment: 'دفعة إيجار',
        rentalContract: 'عقد إيجار',
        employerApproval: 'تصديق من المشغل على موقع العمل الفعلي ودفع تكاليف السفر',
        travelApproval: 'تصديق مواصلات/باص من الحسينية أو تصديق استرداد مواصلات للشمال',
        securityApproval: 'تصديق من الوحدة على ظروف الخدمة (قاعدة مغلقة/قريبة من مكان السكن)',
        form1312: 'نموذج 1312 معبأ',
        rentAssistance: 'تصديق على المشاركة في الإيجار من قوات الأمن (إذا كان ذلك مناسباً)',
        businessTax: 'تصديق على دفع ضرائب على العمل',
        businessDocs: 'مستندات تثبت نشاط العمل في المنطقة (فواتير/إيصالات/اتفاقيات)',
        declaration: 'إقرار مفصل يشمل رقم الهوية ورقم الهاتف',
        form1312Copy: 'نسخة من نموذج 1312 الذي قُدم للسلطة المحلية',
        creditCards: 'تفصيل بطاقات ائتمان وكشوفات حساب لـ 12 شهراً',
        lifeCenterProof: 'إثباتات لمركز الحياة: راف-كاف، تزويد وقود، زيارات لصندوق المرضى، اشتراك نادي رياضي',
        companyApproval: 'إذا كنت تعمل مقابل شركة معينة: تصديق على طريقة التعاقد من البيت',
        homeBusinessDocs: 'إذا كان العمل في البيت: فواتير/إيصالات من زبائن من المنطقة',
        rentProofIfNoPayments: 'إثبات دفع الإيجار (إذا كان هناك عقد إيجار ولا توجد دفعات على اسمك)',
        additionalProofs: 'إثباتات إضافية: زيارات لصندوق المرضى، تفصيل راف-كاف، تزويد وقود، اشتراك نادي رياضي'
      }
    }
  };

  const t = translations[language];

  const getQuestions = () => [
    {
      id: 'isResident',
      question: t.questions.isResident,
      options: [
        { value: 'yes', label: t.options.yesResident },
        { value: 'no', label: t.options.noResident }
      ],
      failMessage: t.failMessages.notResident
    },
    {
      id: 'livesInHusniyya',
      question: t.questions.livesInHusniyya,
      options: [
        { value: 'yes', label: t.options.yesLives },
        { value: 'no', label: t.options.noLives }
      ],
      failOnValue: 'no',
      failMessage: t.failMessages.notLivingInHusniyya
    },
    {
      id: 'maritalStatus',
      question: t.questions.maritalStatus,
      options: [
        { value: 'single', label: t.options.single },
        { value: 'married', label: t.options.married }
      ]
    },
    {
      id: 'spouseInHusniyya',
      question: t.questions.spouseInHusniyya,
      showIf: (answers) => answers.maritalStatus === 'married',
      options: [
        { value: 'yes', label: t.options.yesSpouse },
        { value: 'no', label: t.options.noSpouse }
      ],
      failOnValue: 'no',
      failMessage: t.failMessages.spouseNotInHusniyya
    },
    {
      id: 'livingArrangement',
      question: t.questions.livingArrangement,
      options: [
        { value: 'parents', label: t.options.parents },
        { value: 'rental', label: t.options.rental },
        { value: 'owned', label: t.options.owned }
      ]
    },
    {
      id: 'employmentType',
      question: t.questions.employmentType,
      options: [
        { value: 'employee', label: t.options.employee },
        { value: 'selfEmployed', label: t.options.selfEmployed },
        { value: 'security', label: t.options.security }
      ]
    },
    {
      id: 'workLocation',
      question: t.questions.workLocation,
      showIf: (answers) => answers.employmentType === 'employee',
      options: [
        { value: 'nearby', label: t.options.nearby },
        { value: 'haifa_south', label: t.options.haifaSouth }
      ]
    },
    {
      id: 'hasTravelFromHusniyya',
      question: t.questions.hasTravelFromHusniyya,
      showIf: (answers) => answers.employmentType === 'employee' && answers.workLocation === 'haifa_south',
      options: [
        { value: 'yes', label: t.options.yesTravelApproval },
        { value: 'no', label: t.options.noTravelApproval }
      ]
    },
    {
      id: 'securityBaseType',
      question: t.questions.securityBaseType,
      showIf: (answers) => answers.employmentType === 'security',
      options: [
        { value: 'closed', label: t.options.closedBase },
        { value: 'nearby', label: t.options.nearbyBase },
        { value: 'far', label: t.options.farBase }
      ]
    },
    {
      id: 'selfEmployedType',
      question: t.questions.selfEmployedType,
      showIf: (answers) => answers.employmentType === 'selfEmployed',
      options: [
        { value: 'physical', label: t.options.physicalBusiness },
        { value: 'homeOnly', label: t.options.homeOnly }
      ]
    },
    {
      id: 'hasUtilityPayments',
      question: t.questions.hasUtilityPayments,
      showIf: (answers) => answers.employmentType !== 'security' && answers.livingArrangement !== 'parents',
      options: [
        { value: 'yes', label: t.options.yesPayments },
        { value: 'no', label: t.options.noPayments }
      ]
    }
  ];

  const questions = getQuestions();

  const getVisibleQuestions = () => {
    return questions.filter(q => !q.showIf || q.showIf(answers));
  };

  const visibleQuestions = getVisibleQuestions();
  const currentQuestion = visibleQuestions[currentStep];

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    // Check for immediate fail conditions
    if (currentQuestion.failOnValue && value === currentQuestion.failOnValue) {
      setResult({
        cannotProceed: true,
        message: currentQuestion.failMessage
      });
      return;
    }

    if (value === 'no' && currentQuestion.id === 'isResident') {
      setResult({
        cannotProceed: true,
        message: currentQuestion.failMessage
      });
      return;
    }

    // Move to next step
    const updatedVisibleQuestions = questions.filter(q => !q.showIf || q.showIf(newAnswers));
    const nextStep = currentStep + 1;

    if (nextStep >= updatedVisibleQuestions.length) {
      evaluateRequirements(newAnswers);
    } else {
      setCurrentStep(nextStep);
    }
  };

  const evaluateRequirements = (finalAnswers) => {
    const {
      livingArrangement,
      employmentType,
      workLocation,
      hasTravelFromHusniyya,
      securityBaseType,
      selfEmployedType,
      hasUtilityPayments
    } = finalAnswers;

    let requirements = [];
    let submitTo = 'localAuthority';
    let showEmail = false;

    // Always start with ID
    requirements.push(t.requirements.idWithAppendix);

    // Security forces
    if (employmentType === 'security') {
      if (securityBaseType === 'closed' || securityBaseType === 'nearby') {
        if (livingArrangement === 'rental') {
          requirements.push(t.requirements.rentPayment);
          requirements.push(t.requirements.rentalContract);
        } else if (livingArrangement === 'owned') {
          requirements.push(t.requirements.arnonaPayment);
          requirements.push(t.requirements.waterPayment);
        }
        requirements.push(t.requirements.securityApproval);
        if (securityBaseType === 'closed') {
          requirements.push(t.requirements.rentAssistance);
        }
      } else {
        // Far open base - submit to tax authority
        submitTo = 'taxAuthority';
        showEmail = true;
        requirements = [
          t.requirements.declaration,
          t.requirements.form1312Copy,
          t.requirements.creditCards,
          t.requirements.lifeCenterProof
        ];
      }
    }
    // Self-employed with physical business
    else if (employmentType === 'selfEmployed' && selfEmployedType === 'physical') {
      if (livingArrangement === 'rental') {
        requirements.push(t.requirements.rentPayment);
        requirements.push(t.requirements.rentalContract);
      } else if (livingArrangement === 'owned') {
        requirements.push(t.requirements.arnonaPayment);
        requirements.push(t.requirements.waterPayment);
      }
      requirements.push(t.requirements.businessTax);
      requirements.push(t.requirements.businessDocs);
    }
    // Self-employed working from home - submit to tax authority
    else if (employmentType === 'selfEmployed' && selfEmployedType === 'homeOnly') {
      submitTo = 'taxAuthority';
      showEmail = true;
      requirements = [
        t.requirements.declaration,
        t.requirements.form1312Copy,
        t.requirements.creditCards,
        t.requirements.lifeCenterProof,
        t.requirements.companyApproval,
        t.requirements.homeBusinessDocs
      ];
    }
    // Employee working nearby
    else if (employmentType === 'employee' && workLocation === 'nearby') {
      if (livingArrangement === 'rental') {
        requirements.push(t.requirements.rentPayment);
        requirements.push(t.requirements.rentalContract);
      } else if (livingArrangement === 'owned') {
        requirements.push(t.requirements.arnonaPayment);
        requirements.push(t.requirements.waterPayment);
      }
      requirements.push(t.requirements.employerApproval);
    }
    // Employee in Haifa/South with travel approval
    else if (employmentType === 'employee' && workLocation === 'haifa_south' && hasTravelFromHusniyya === 'yes') {
      if (livingArrangement === 'rental') {
        requirements.push(t.requirements.rentPayment);
        requirements.push(t.requirements.rentalContract);
      } else if (livingArrangement === 'owned') {
        requirements.push(t.requirements.arnonaPayment);
        requirements.push(t.requirements.waterPayment);
      }
      requirements.push(t.requirements.travelApproval);
    }
    // Employee in Haifa/South without travel approval - submit to tax authority
    else if (employmentType === 'employee' && workLocation === 'haifa_south') {
      submitTo = 'taxAuthority';
      showEmail = true;
      requirements = [
        t.requirements.declaration,
        t.requirements.form1312Copy,
        t.requirements.rentProofIfNoPayments,
        t.requirements.creditCards,
        t.requirements.employerApproval,
        t.requirements.additionalProofs
      ];
    }
    // Owner with payments
    else if (livingArrangement === 'owned' && hasUtilityPayments === 'yes') {
      requirements.push(t.requirements.arnonaPayment);
      requirements.push(t.requirements.waterPayment);
      if (employmentType === 'employee') {
        requirements.push(t.requirements.employerApproval);
      }
    }
    // Rental with payments
    else if (livingArrangement === 'rental' && hasUtilityPayments === 'yes') {
      requirements.push(t.requirements.rentPayment);
      requirements.push(t.requirements.rentalContract);
      if (employmentType === 'employee') {
        requirements.push(t.requirements.employerApproval);
      }
    }
    // Living with parents
    else if (livingArrangement === 'parents') {
      if (employmentType === 'employee') {
        requirements.push(t.requirements.employerApproval);
      }
    }

    setResult({
      requirements,
      submitTo,
      showEmail,
      answers: finalAnswers
    });
  };

  const resetForm = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  const getResultContent = () => {
    if (!result) return null;

    if (result.cannotProceed) {
      return (
        <div className="result-card cannot-proceed">
          <div className="result-icon">!</div>
          <h2>{t.cannotContinue}</h2>
          <p>{result.message}</p>
          <button onClick={resetForm} className="reset-btn">
            {t.startOver}
          </button>
        </div>
      );
    }

    return (
      <div className="result-card documents">
        <div className="result-icon">📋</div>
        <h2>{t.requiredDocs}</h2>

        <div className="submit-to-box">
          <span className="submit-label">{t.submitTo}</span>
          <span className="submit-value">
            {result.submitTo === 'localAuthority' ? t.localAuthority : t.taxAuthority}
          </span>
        </div>

        {result.showEmail && (
          <div className="email-box">
            <span className="email-label">{t.emailContact}</span>
            <a href={`mailto:${t.taxEmail}`} className="email-link">{t.taxEmail}</a>
          </div>
        )}

        {result.submitTo === 'localAuthority' && (
          <div className="form-link-box">
            <span className="form-label">{t.fillForm}</span>
            <a href="https://mas.misgav.org.il" target="_blank" rel="noopener noreferrer" className="form-link">mas.misgav.org.il</a>
          </div>
        )}

        <div className="requirements-section">
          <ul>
            {result.requirements.map((req, index) => (
              <li key={index}>
                <span className="check-icon">✓</span>
                {req}
              </li>
            ))}
          </ul>
        </div>

        {result.submitTo === 'taxAuthority' && (
          <div className="important-note">
            <strong>{t.important}</strong> {t.taxRefundLimit}
          </div>
        )}

        <button onClick={resetForm} className="reset-btn secondary">
          {t.newCheck}
        </button>
      </div>
    );
  };

  const progress = result ? 100 : ((currentStep + 1) / visibleQuestions.length) * 100;

  return (
    <div className="eligibility-checker">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&family=Heebo:wght@300;400;500;600;700&display=swap');

        .eligibility-checker {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'Segoe UI', 'Rubik', 'Heebo', sans-serif;
          direction: rtl;
          padding: 0;
          position: relative;
          overflow: hidden;
        }

        .container {
          max-width: 680px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          padding: 40px 20px;
        }

        .lang-switch {
          position: absolute;
          top: 20px;
          left: 20px;
          background: #fff;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 20px;
          color: #1a365d;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .lang-switch:hover {
          background: #f8fafc;
          border-color: #1a365d;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          background: linear-gradient(135deg, #1e3a5f 0%, #1a365d 50%, #153e75 100%);
          padding: 40px 24px;
          border-radius: 16px;
          margin: -40px -20px 40px -20px;
        }

        .header h1 {
          color: #fff;
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
        }

        .header p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          margin: 0;
          font-weight: 400;
        }

        .progress-container {
          margin-bottom: 32px;
        }

        .progress-bar {
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1a365d, #2c5282);
          border-radius: 3px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          color: #718096;
          font-size: 13px;
        }

        .question-card {
          background: #fff;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px;
          animation: slideUp 0.4s ease-out;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .step-indicator {
          display: inline-block;
          background: #1a365d;
          color: #fff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .question-text {
          color: #1a365d;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 32px 0;
          line-height: 1.4;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .option-btn {
          background: #fff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px 24px;
          color: #1a365d;
          font-size: 16px;
          font-family: inherit;
          text-align: right;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .option-btn::before {
          content: '';
          width: 22px;
          height: 22px;
          border: 2px solid #e2e8f0;
          border-radius: 50%;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .option-btn:hover {
          background: #f8fafc;
          border-color: #1a365d;
          transform: translateX(-4px);
        }

        .option-btn:hover::before {
          border-color: #1a365d;
          background: rgba(26, 54, 93, 0.1);
        }

        .result-card {
          background: #fff;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          padding: 48px 40px;
          text-align: center;
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .result-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 24px;
          font-weight: 700;
        }

        .result-card.documents .result-icon {
          background: #4299e1;
          color: #fff;
          box-shadow: 0 10px 30px rgba(66, 153, 225, 0.3);
        }

        .result-card.cannot-proceed .result-icon {
          background: #ed8936;
          color: #fff;
          box-shadow: 0 10px 30px rgba(237, 137, 54, 0.3);
        }

        .result-card h2 {
          color: #1a365d;
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 24px 0;
        }

        .result-card > p {
          color: #718096;
          font-size: 16px;
          margin: 0 0 32px 0;
          line-height: 1.6;
        }

        .submit-to-box {
          background: #ebf8ff;
          border: 2px solid #4299e1;
          border-radius: 12px;
          padding: 20px 28px;
          margin: 0 0 20px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .submit-label {
          color: #718096;
          font-size: 14px;
        }

        .submit-value {
          color: #2b6cb0;
          font-size: 18px;
          font-weight: 700;
        }

        .email-box {
          background: #faf5ff;
          border: 2px solid #9f7aea;
          border-radius: 12px;
          padding: 16px 24px;
          margin: 0 0 20px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .email-label {
          color: #718096;
          font-size: 14px;
        }

        .email-link {
          color: #6b46c1;
          font-size: 18px;
          font-weight: 600;
          text-decoration: none;
          direction: ltr;
        }

        .email-link:hover {
          text-decoration: underline;
        }

        .form-link-box {
          background: #f0fff4;
          border: 2px solid #48bb78;
          border-radius: 12px;
          padding: 20px 28px;
          margin: 0 0 24px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .form-label {
          color: #718096;
          font-size: 15px;
        }

        .form-link {
          color: #276749;
          font-size: 20px;
          font-weight: 700;
          text-decoration: none;
          direction: ltr;
          padding: 10px 24px;
          background: #c6f6d5;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .form-link:hover {
          background: #9ae6b4;
          transform: scale(1.02);
        }

        .requirements-section {
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 28px;
          margin: 24px 0;
          text-align: right;
        }

        .requirements-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .requirements-section li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #1a365d;
          font-size: 15px;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
          line-height: 1.5;
        }

        .requirements-section li:last-child {
          border-bottom: none;
        }

        .check-icon {
          color: #48bb78;
          font-weight: 700;
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          background: #f0fff4;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
        }

        .important-note {
          background: #fffaf0;
          border: 2px solid #ed8936;
          border-radius: 12px;
          padding: 16px 20px;
          margin: 20px 0;
          color: #c05621;
          font-size: 14px;
          text-align: center;
        }

        .important-note strong {
          color: #c05621;
        }

        .reset-btn {
          background: #1a365d;
          border: none;
          border-radius: 10px;
          padding: 14px 28px;
          color: #fff;
          font-size: 15px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 16px;
        }

        .reset-btn:hover {
          background: #2c5282;
          transform: translateY(-2px);
        }

        .reset-btn.secondary {
          background: transparent;
          border: 2px solid #e2e8f0;
          color: #1a365d;
        }

        .reset-btn.secondary:hover {
          background: #f8fafc;
          border-color: #1a365d;
        }

        .disclaimer-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #d97706;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
          text-align: center;
        }

        .disclaimer-icon {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .disclaimer-text {
          color: #92400e;
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
          font-weight: 500;
        }

        .footer-note {
          text-align: center;
          margin-top: 32px;
          padding: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .footer-note p {
          color: #718096;
          font-size: 13px;
          margin: 0;
          line-height: 1.6;
        }

        @media (max-width: 600px) {
          .container {
            padding: 24px 16px;
          }

          .lang-switch {
            top: 10px;
            left: 10px;
            padding: 8px 16px;
            font-size: 13px;
          }

          .header {
            padding: 30px 20px;
            margin: -24px -16px 30px -16px;
          }

          .header h1 {
            font-size: 24px;
          }

          .header p {
            font-size: 14px;
          }

          .question-card {
            padding: 28px 20px;
          }

          .question-text {
            font-size: 20px;
          }

          .option-btn {
            padding: 16px 18px;
            font-size: 15px;
          }

          .result-card {
            padding: 36px 24px;
          }

          .result-card h2 {
            font-size: 22px;
          }

          .requirements-section {
            padding: 20px;
          }

          .requirements-section li {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="container">
        <button
          className="lang-switch"
          onClick={() => setLanguage(language === 'he' ? 'ar' : 'he')}
        >
          {language === 'he' ? 'العربية' : 'עברית'}
        </button>

        <header className="header">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </header>

        <div className="disclaimer-box">
          <div className="disclaimer-icon">ℹ️</div>
          <p className="disclaimer-text">{t.disclaimer}</p>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-text">
            <span>{result ? t.completed : `${t.question} ${currentStep + 1} ${t.of} ${visibleQuestions.length}`}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {!result ? (
          <div className="question-card" key={currentStep}>
            <span className="step-indicator">{t.step} {currentStep + 1}</span>
            <h2 className="question-text">{currentQuestion.question}</h2>
            <div className="options-list">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  className="option-btn"
                  onClick={() => handleAnswer(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          getResultContent()
        )}

        <div className="footer-note">
          <p>
            {t.footerNote}
            <br />
            {t.footerContact}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResidentEligibilityChecker;
