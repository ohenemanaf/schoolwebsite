// ─────────────────────────────────────────────────────────────────────────────
//  School settings. Every page of the website is built from this file.
//  After editing, run:  node tools/build.mjs
//  Dates are written 'YYYY-MM-DD'. Money is a plain number (no commas).
// ─────────────────────────────────────────────────────────────────────────────

export default {
    // Shows a slim "demo school" notice on every page. Set to false for a real school.
    demo: true,

    name: 'Greenfield Academy',
    shortName: 'Greenfield',
    founded: 1994,
    motto: 'Nurturing Minds, Building Futures',
    // One sentence used under the name on the home page and in search results.
    intro: 'A Creche to Junior High School in Accra where every child is known, challenged and cared for, following the national curriculum from the first day of school to the BECE.',
    // Optional logo image, e.g. 'assets/logo.png'. Leave empty for the cap mark.
    logo: '',
    // Colours: brand is the main colour (header, buttons), accent the highlight.
    brand: '#0e4a37',
    accent: '#f2b33d',
    url: 'https://ohenemanaf.github.io/schoolwebsite/',

    contact: {
        phone: '030 000 0000',
        whatsapp: '233200000000',      // digits only with country code; empty = forms use email
        email: 'office@example.com',
        address: '12 Example Road, Accra',
        landmark: 'Behind the sample community centre',
        mapQuery: 'Accra, Ghana',
        officeHours: 'Monday to Friday, 7:30 am to 4:00 pm',
    },
    social: { facebook: '', instagram: '', youtube: '' },

    // Short notices that scroll across the top of the home page.
    announcements: [
        'Admissions are open for the 2027/2028 academic year',
        'Term 1 ends with the Carols Service on Friday 18 December',
        'Congratulations to our BECE candidates: 92% passed',
        'Inter-House Sports Festival on Friday 19 February',
        'New uniforms are available at the school office',
    ],

    // Figures on the home page. These are samples: use the school's real numbers.
    stats: [
        { value: 32, suffix: '+', label: 'Years of teaching' },
        { value: 1200, suffix: '+', label: 'Pupils enrolled' },
        { value: 68, label: 'Qualified staff' },
        { value: 92, suffix: '%', label: 'BECE pass rate, 2026' },
    ],

    // Photos live in assets/photos. Every photo used must be listed in `photoCredits`.
    photos: {
        hero: 'hero.webp',
        about: 'students-teacher.webp',
        welcome: 'flag-assembly.webp',
        admissions: 'walking-girls.webp',
        cta: 'walk-to-school.webp',
    },

    welcome: {
        from: 'Mr. Emmanuel Asante',
        role: 'Headmaster',
        text: [
            'At Greenfield Academy, education is more than results. It is about building the character and resilience children need to thrive in a fast-changing world.',
            'For over three decades we have kept the same promise: a safe, caring school where every pupil is known by name, valued and challenged to reach their best. Welcome to our family.',
        ],
    },

    mission: 'To give every learner a well-rounded education that helps them reach their full potential, within a caring and disciplined community.',
    vision: 'To be the most trusted school in our community: academically excellent and morally grounded.',
    values: ['Integrity', 'Discipline', 'Excellence', 'Respect', 'Community service'],

    history: [
        { year: 1994, title: 'The first classrooms', text: 'Greenfield opened with 3 classrooms, 8 teachers and 80 pupils, to bring good primary education to the community.' },
        { year: 2005, title: 'Junior High School', text: 'At parents’ request we opened the JHS block, with the school’s first computer room and science corner.' },
        { year: 2015, title: 'Creche and new library', text: 'A purpose-built creche and a library of over 15,000 books made Greenfield a school from the very first years.' },
        { year: 2023, title: 'Best Community School', text: 'Named Best Community School, and opened a new sports field and digital resource centre.' },
    ],

    facilities: [
        { icon: 'library', title: 'Library and resource centre', text: 'Over 15,000 books, quiet reading corners and a digital learning suite.', photo: 'library.webp' },
        { icon: 'laptop', title: 'ICT lab', text: 'Forty desktop computers with internet, used from Basic 4 for Computing lessons.', photo: 'ict.webp' },
        { icon: 'school', title: 'Bright classrooms', text: 'Airy classrooms with no more than 35 pupils, so teachers know every child.', photo: 'reading-test.webp' },
        { icon: 'volleyball', title: 'Sports grounds', text: 'A football pitch, volleyball and basketball courts, and space for athletics.', photo: 'independence-march.webp' },
    ],

    // Levels taught. `id` is used in links (e.g. curriculum.html#primary).
    levels: [
        {
            id: 'creche', icon: 'baby', name: 'Creche and Nursery', ages: 'Ages 1 to 3',
            text: 'A calm, safe start focused on health, wellbeing and early development, through play, songs and stories.',
            subjects: ['Play and movement', 'Songs and rhymes', 'Early language', 'Social skills'],
        },
        {
            id: 'kindergarten', icon: 'blocks', name: 'Kindergarten', ages: 'KG 1 and KG 2, ages 4 to 5',
            text: 'Play-based learning built on the 4Rs: Reading, wRiting, aRithmetic and cReativity.',
            subjects: ['Literacy', 'Numeracy', 'Creative Arts', 'Our World, Our People'],
        },
        {
            id: 'primary', icon: 'book-open', name: 'Primary School', ages: 'Basic 1 to Basic 6',
            text: 'The national standards-based curriculum, with Computing and French from Basic 4 and the National Standard Assessment Test (NSAT) in Basic 2, 4 and 6.',
            subjects: ['English', 'Mathematics', 'Science', 'Our World, Our People', 'Religious and Moral Education', 'History', 'Creative Arts', 'Physical Education', 'Computing (B4+)', 'French (B4+)'],
        },
        {
            id: 'jhs', icon: 'graduation-cap', name: 'Junior High School', ages: 'JHS 1 to JHS 3',
            text: 'The Common Core Programme, preparing pupils for the BECE and for the academic or technical path they choose in Senior High School.',
            subjects: ['English', 'Ghanaian Language', 'Mathematics', 'Science', 'Social Studies', 'Religious and Moral Education', 'Computing', 'Career Technology', 'Creative Arts and Design', 'Physical and Health Education'],
        },
    ],
    approach: [
        { icon: 'brain', title: 'Thinking, not memorising', text: 'Pupils learn to question, test ideas and solve real problems.' },
        { icon: 'monitor', title: 'Digital skills', text: 'Computing is part of learning from Upper Primary onwards.' },
        { icon: 'users', title: 'Speaking and teamwork', text: 'Group projects, debates and presentations build confidence.' },
    ],

    admissions: {
        year: '2027/2028',
        formFee: 30,
        steps: [
            { title: 'Send an enquiry', text: 'Use the form on this page, call, or visit the school office.' },
            { title: 'Bring the documents', text: 'Birth certificate, last school report, two passport photos and a parent’s ID.' },
            { title: 'Placement assessment', text: 'New Primary and JHS pupils do a short English and Mathematics assessment.' },
            { title: 'Meet the Headmaster', text: 'A short conversation with parents. We give our answer within 5 working days.' },
            { title: 'Pay and start', text: 'Pay the first term’s fees and collect the uniform list, timetable and welcome pack.' },
        ],
        requirements: [
            { icon: 'baby', title: 'Age', text: 'Nursery pupils should be at least 2, and Kindergarten pupils 4, by September.' },
            { icon: 'clipboard-check', title: 'Readiness', text: 'For Primary and JHS we check reading and numbers so each child is placed in the right class.' },
            { icon: 'heart', title: 'Shared values', text: 'We welcome families who share our commitment to discipline, respect and hard work.' },
        ],
    },

    currency: 'GH₵',
    fees: {
        year: '2026/2027',
        note: 'Fees are per term (3 terms a year) and include tuition, library and ICT access, and basic clubs.',
        plans: [
            { level: 'Early years', covers: 'Creche, Nursery and Kindergarten', perTerm: 2500, includes: ['Tuition and assessment', 'Learning materials and crafts', 'Mid-morning snack'] },
            { level: 'Primary', covers: 'Basic 1 to Basic 6', perTerm: 3200, popular: true, includes: ['Tuition and assessment', 'Library and ICT lab', 'Termly excursion', 'Sports and clubs'] },
            { level: 'Junior High', covers: 'JHS 1 to JHS 3', perTerm: 4000, includes: ['Tuition and practicals', 'Science room and library', 'Career guidance', 'BECE registration (JHS 3)'] },
        ],
        // Discount on the fees of the 2nd, 3rd and 4th-or-later child.
        siblingDiscounts: [5, 10, 15],
        payment: [
            { icon: 'landmark', title: 'Bank transfer', text: 'Sample Bank, account name Greenfield Academy' },
            { icon: 'smartphone', title: 'Mobile Money', text: 'Merchant ID shown at the school office' },
            { icon: 'banknote', title: 'At the school office', text: 'Cash or bank draft, with an official receipt' },
        ],
    },

    calendar: {
        year: '2026/2027',
        terms: [
            { name: 'Term 1', starts: '2026-09-08', ends: '2026-12-18' },
            { name: 'Term 2', starts: '2027-01-12', ends: '2027-04-01' },
            { name: 'Term 3', starts: '2027-04-27', ends: '2027-07-23' },
        ],
        // type: 'term' (start/end of term), 'holiday', or 'event'.
        events: [
            { date: '2026-09-08', time: '7:30 am', title: 'School reopens for Term 1', place: 'Main campus', type: 'term' },
            { date: '2026-10-14', time: '10:00 am', title: 'PTA general meeting', place: 'Assembly hall', type: 'event' },
            { date: '2026-11-05', title: 'Mid-term assessments begin', place: 'All classes', type: 'event' },
            { date: '2026-12-04', time: '9:00 am', title: 'Science and Innovation Fair', place: 'Assembly hall', type: 'event' },
            { date: '2026-12-18', time: '1:00 pm', title: 'End of Term 1 and Carols Service', place: 'Assembly hall', type: 'term' },
            { date: '2027-01-12', time: '7:30 am', title: 'School reopens for Term 2', place: 'Main campus', type: 'term' },
            { date: '2027-02-19', time: '9:00 am', title: 'Inter-House Sports Festival', place: 'Sports grounds', type: 'event' },
            { date: '2027-03-06', title: 'Independence Day (no school)', type: 'holiday' },
            { date: '2027-03-25', time: '8:00 am', title: 'End of term examinations', place: 'All classes', type: 'event' },
            { date: '2027-04-27', time: '7:30 am', title: 'School reopens for Term 3', place: 'Main campus', type: 'term' },
            { date: '2027-05-21', time: '9:00 am', title: 'Cultural Day', place: 'Main campus', type: 'event' },
            { date: '2027-07-23', time: '9:00 am', title: 'Speech and Prize Giving Day', place: 'Main campus', type: 'term' },
        ],
    },

    news: [
        { date: '2026-10-20', tag: 'Achievement', title: '92% of our BECE candidates passed', text: 'Our 2026 JHS 3 class did us proud, with 34 pupils earning distinctions.', photo: 'flag-assembly.webp' },
        { date: '2026-10-02', tag: 'Community', title: 'Pupils plant 200 trees around the school', text: 'Every class planted and named a tree as part of our environment club’s green-school project.', photo: 'tree-planting.webp' },
        { date: '2026-09-18', tag: 'Campus', title: 'New computers for the ICT lab', text: 'Thanks to our PTA, the ICT lab now has 40 new desktop computers.', photo: 'ict.webp' },
        { date: '2026-09-08', tag: 'Culture', title: 'Our choir invited to the regional arts festival', text: 'Greenfield Voices will perform traditional and choral music in March.', photo: 'cultural-day.webp' },
    ],

    // Gallery: photo file, caption and category (any words; each becomes a filter).
    gallery: [
        { photo: 'assembly.webp', caption: 'Morning assembly', category: 'School life' },
        { photo: 'library.webp', caption: 'Reading in the library', category: 'Learning' },
        { photo: 'cultural-day.webp', caption: 'Cultural Day dancers', category: 'Culture' },
        { photo: 'independence-march.webp', caption: 'Independence Day march', category: 'Events' },
        { photo: 'tree-planting.webp', caption: 'Tree planting day', category: 'Events' },
        { photo: 'friends.webp', caption: 'Friends at break time', category: 'School life' },
        { photo: 'ict.webp', caption: 'Learning with technology', category: 'Learning' },
        { photo: 'uniform.webp', caption: 'Ready for school', category: 'School life' },
        { photo: 'reading-test.webp', caption: 'Reading assessment', category: 'Learning' },
        { photo: 'walk-to-school.webp', caption: 'On the way to school', category: 'School life' },
        { photo: 'flag-assembly.webp', caption: 'JHS pupils at the flag', category: 'Events' },
        { photo: 'students-teacher.webp', caption: 'Class with their teacher', category: 'Learning' },
    ],

    staff: [
        { name: 'Mr. Emmanuel Asante', role: 'Headmaster', qualifications: 'MEd, BA (Ed)' },
        { name: 'Mrs. Abena Mensah', role: 'Deputy Headmistress', qualifications: 'BSc (Ed), PGDE' },
        { name: 'Mr. Kofi Boateng', role: 'Head of Science', qualifications: 'BSc Chemistry, PGDE' },
        { name: 'Miss Akua Frimpong', role: 'Head of Mathematics', qualifications: 'BSc Mathematics, BEd' },
        { name: 'Mr. Kwame Osei', role: 'Head of Humanities', qualifications: 'BA History, PGDE' },
        { name: 'Mrs. Grace Addo', role: 'Head of Languages', qualifications: 'BA French, MEd' },
    ],

    faqs: [
        { q: 'When can my child join?', a: 'Most pupils join in September, at the start of Term 1. We also admit pupils in Terms 2 and 3 when there are places.' },
        { q: 'What time does school start and end?', a: 'Pupils should arrive by 7:30 am for assembly at 8:00 am. Classes end at 2:30 pm for Creche and Kindergarten and 3:00 pm for Primary and JHS.' },
        { q: 'Do you offer discounts for siblings?', a: 'Yes. The second child gets 5% off, the third 10% and the fourth or later 15%. See the fees page for details.' },
        { q: 'Do you provide meals?', a: 'Creche and Kindergarten pupils get a mid-morning snack. Lunch can be bought at the school canteen, or pupils can bring their own.' },
        { q: 'How do parents hear about school news?', a: 'Through notices on this website, termly PTA meetings, and messages from class teachers.' },
    ],

    // Credits for every photo in assets/photos (shown on the gallery page).
    photoCredits: [
        { files: ['hero.webp'], title: 'Ghana school under the trees', author: 'A. Kauffeld, USAID', licence: 'Public domain' },
        { files: ['students-teacher.webp'], title: 'Ghana students', author: 'Henry Akorsu, USAID', licence: 'Public domain' },
        { files: ['assembly.webp', 'library.webp', 'cultural-day.webp'], title: 'A&B Schools Cluster, Accra', author: 'USAID', licence: 'Public domain' },
        { files: ['friends.webp'], title: 'Ghana children', author: 'USAID Africa Bureau', licence: 'Public domain' },
        { files: ['tree-planting.webp', 'ict.webp', 'uniform.webp', 'walking-girls.webp', 'walk-to-school.webp'], title: 'Pupils in Ghana', author: 'Bright Kwame Ayisi', licence: 'CC0' },
        { files: ['flag-assembly.webp'], title: 'Ghana Junior High School students, Winneba', author: 'OER Africa', licence: 'CC BY 2.0' },
        { files: ['independence-march.webp'], title: 'Ghana 54th', author: 'Ben Sutherland', licence: 'CC BY 2.0' },
        { files: ['reading-test.webp'], title: 'Ghana class during school reading tests', author: 'Charlie from United Kingdom', licence: 'CC BY 2.0' },
    ],
};
