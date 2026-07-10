import "dotenv/config";
import { db } from "./index";
import { products, reviews, type NewProduct } from "./schema";

const img = {
  // makeup
  lipsticksRow:
    "https://images.pexels.com/photos/7810600/pexels-photo-7810600.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  lipsticksClose:
    "https://images.pexels.com/photos/7810602/pexels-photo-7810602.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  lipTints:
    "https://images.pexels.com/photos/6527704/pexels-photo-6527704.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  matteLip:
    "https://images.pexels.com/photos/6527698/pexels-photo-6527698.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  makeupPurple:
    "https://images.pexels.com/photos/6527702/pexels-photo-6527702.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  flatlayPurple:
    "https://images.pexels.com/photos/6527699/pexels-photo-6527699.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  paletteBlue:
    "https://images.pexels.com/photos/6527697/pexels-photo-6527697.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  compact:
    "https://images.pexels.com/photos/30820516/pexels-photo-30820516.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  luxuryFlatlay:
    "https://images.pexels.com/photos/3750640/pexels-photo-3750640.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  // skincare
  pinkBottles:
    "https://images.pexels.com/photos/24602077/pexels-photo-24602077.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  serumToner:
    "https://images.pexels.com/photos/20382236/pexels-photo-20382236.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  glowSerum:
    "https://images.pexels.com/photos/29060236/pexels-photo-29060236.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  violetJar:
    "https://images.pexels.com/photos/35976902/pexels-photo-35976902.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  cicaMist:
    "https://images.pexels.com/photos/24602072/pexels-photo-24602072.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  serumClose:
    "https://images.pexels.com/photos/5113052/pexels-photo-5113052.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  heartleaf:
    "https://images.pexels.com/photos/29060213/pexels-photo-29060213.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  dropperBottles:
    "https://images.pexels.com/photos/31251024/pexels-photo-31251024.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  serumPink:
    "https://images.pexels.com/photos/24602064/pexels-photo-24602064.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  // hair
  haircareRow:
    "https://images.pexels.com/photos/19833253/pexels-photo-19833253.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  herbalShampoo:
    "https://images.pexels.com/photos/18066458/pexels-photo-18066458.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  hairSpray:
    "https://images.pexels.com/photos/7546589/pexels-photo-7546589.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  milkBottle:
    "https://images.pexels.com/photos/36183642/pexels-photo-36183642.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  // perfume
  perfumeGray:
    "https://images.pexels.com/photos/6958875/pexels-photo-6958875.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  perfumeBlack:
    "https://images.pexels.com/photos/35930230/pexels-photo-35930230.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  perfumeSky:
    "https://images.pexels.com/photos/28406043/pexels-photo-28406043.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  perfumeGold:
    "https://images.pexels.com/photos/16722501/pexels-photo-16722501.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  perfumeBox:
    "https://images.pexels.com/photos/16722451/pexels-photo-16722451.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  perfumeSculpture:
    "https://images.pexels.com/photos/16722500/pexels-photo-16722500.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  giftBox:
    "https://images.pexels.com/photos/30999236/pexels-photo-30999236.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

interface SeedProduct extends Omit<NewProduct, "images"> {
  images: string[];
  reviews: { author: string; rating: number; title: string; comment: string }[];
}

const data: SeedProduct[] = [
  {
    slug: "velvet-matte-lipstick-ruby",
    name: "أحمر شفاه فيلفيت مات - روبي",
    brand: "VELISIABEAUTY",
    category: "makeup",
    shortDescription: "لون غني يدوم طويلاً بلمسة مخملية ناعمة",
    description:
      "أحمر شفاه بتركيبة مخملية مطفية تمنح شفتيكِ لوناً جريئاً يدوم حتى ٨ ساعات دون أن يجف. غني بزبدة الشيا وفيتامين E لترطيب فائق وإحساس مريح طوال اليوم. مثالي لإطلالة نهارية أنيقة أو مسائية جذابة.",
    price: "129",
    oldPrice: "169",
    images: [img.lipsticksClose, img.lipsticksRow, img.matteLip],
    rating: "4.8",
    reviewCount: 3,
    stock: 64,
    isFeatured: true,
    isBestseller: true,
    isNew: true,
    reviews: [
      { author: "نورة العتيبي", rating: 5, title: "لون رائع وثبات ممتاز", comment: "اللون طلع نفس الصورة بالضبط وثباته خيالي، لبس معي طول اليوم بدون ما ينشف شفايفي. صرت أطلبه بأكثر من درجة!" },
      { author: "ريم الشمري", rating: 5, title: "مرطب وناعم", comment: "أحلى شي إنه ما ينشف الشفايف مثل باقي المات، ملمسه مخملي ومريح." },
      { author: "دانة", rating: 4, title: "حلو بس التوصيل تأخر", comment: "المنتج ممتاز واللون فخم، بس التوصيل أخذ وقت أطول شوي." },
    ],
  },
  {
    slug: "silk-foundation-natural",
    name: "كريم أساس سيلك تاتش",
    brand: "ESTÉE LAUDER",
    category: "makeup",
    shortDescription: "تغطية متوسطة بلمسة طبيعية مشرقة",
    description:
      "كريم أساس خفيف الوزن بتغطية قابلة للبناء يوحّد لون البشرة ويمنحها إشراقة طبيعية تدوم ٢٤ ساعة. تركيبة مقاومة للعرق والرطوبة، غير لامعة، مناسبة لجميع أنواع البشرة. متوفر بدرجات متعددة تناسب البشرة العربية.",
    price: "215",
    oldPrice: null,
    images: [img.dropperBottles, img.serumToner, img.flatlayPurple],
    rating: "4.7",
    reviewCount: 2,
    stock: 40,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "سارة القحطاني", rating: 5, title: "تغطية مثالية", comment: "يغطي حبوب البشرة بشكل رائع ويعطي مظهر طبيعي مو ثقيل، أنصح فيه بشدة." },
      { author: "هند", rating: 4, title: "جميل لكن يحتاج فيكس", comment: "التغطية ممتازة بس بشرتي دهنية فأحتاج بودرة تثبيت معه." },
    ],
  },
  {
    slug: "nude-eyeshadow-palette",
    name: "باليت ظلال عيون - نيود دريم",
    brand: "TOO FACED",
    category: "makeup",
    shortDescription: "١٢ درجة ترابية ناعمة قابلة للدمج",
    description:
      "باليت ظلال عيون يضم ١٢ درجة ترابية بين المطفي واللامع، بتركيبة مخملية عالية التصبغ سهلة الدمج تدوم طويلاً دون تطاير. مثالي لإنشاء إطلالات نهارية هادئة أو سموكي مسائي جريء.",
    price: "189",
    oldPrice: "239",
    images: [img.paletteBlue, img.makeupPurple, img.compact],
    rating: "4.9",
    reviewCount: 2,
    stock: 33,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "لمياء", rating: 5, title: "ألوان تصبغها خرافي", comment: "الألوان واضحة وتصبغها قوي من أول مسحة، والدمج سهل جداً. من أفضل الباليتات اللي جربتها." },
      { author: "أفنان", rating: 5, title: "يستاهل كل ريال", comment: "التغليف فخم والألوان تناسب كل المناسبات." },
    ],
  },
  {
    slug: "liquid-blush-peach",
    name: "بلاشر سائل - خوخي متوهج",
    brand: "RARE BEAUTY",
    category: "makeup",
    shortDescription: "خدود وردية طبيعية بلمسة متوهجة",
    description:
      "بلاشر سائل خفيف يمنح خدودكِ لوناً خوخياً طبيعياً بلمسة نهاية متوهجة. قطرة واحدة تكفي لإطلالة نضرة تدوم طوال اليوم. يمتزج بسهولة بأطراف الأصابع أو بالإسفنجة.",
    price: "99",
    oldPrice: null,
    images: [img.lipTints, img.matteLip, img.makeupPurple],
    rating: "4.6",
    reviewCount: 1,
    stock: 58,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    reviews: [
      { author: "جواهر", rating: 5, title: "طبيعي وخفيف", comment: "يعطي نضارة حلوة للوجه وكمية بسيطة تكفي، اللون يناسب بشرتي." },
    ],
  },
  {
    slug: "radiance-vitamin-c-serum",
    name: "سيرم فيتامين سي المضيء",
    brand: "VELISIABEAUTY",
    category: "skincare",
    shortDescription: "لتوحيد لون البشرة ومحاربة البقع",
    description:
      "سيرم مركّز بفيتامين سي بتركيز ١٥٪ مع حمض الهيالورونيك، يعمل على توحيد لون البشرة وتفتيح البقع الداكنة ومنح البشرة إشراقة صحية. خفيف وسريع الامتصاص، مناسب للاستخدام اليومي صباحاً.",
    price: "179",
    oldPrice: "229",
    images: [img.serumClose, img.glowSerum, img.dropperBottles],
    rating: "4.9",
    reviewCount: 3,
    stock: 47,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "منيرة", rating: 5, title: "فرق واضح بأسبوعين", comment: "بشرتي صارت أنضر والبقع بدأت تخف، ملمسه خفيف وما يسبب دهون." },
      { author: "شهد الحربي", rating: 5, title: "أفضل سيرم جربته", comment: "الرائحة حلوة والامتصاص سريع، صار أساسي في روتيني الصباحي." },
      { author: "غيداء", rating: 4, title: "ممتاز", comment: "نتيجة جيدة بس أتمنى الحجم يكون أكبر." },
    ],
  },
  {
    slug: "rose-collagen-cream",
    name: "كريم الكولاجين بالورد",
    brand: "VELISIABEAUTY",
    category: "skincare",
    shortDescription: "ترطيب عميق ونضارة تدوم ٢٤ ساعة",
    description:
      "كريم مرطب غني بالكولاجين وخلاصة الورد الدمشقي، يمنح البشرة ترطيباً عميقاً ويحسّن مرونتها ويقلل ظهور الخطوط الدقيقة. قوامه المخملي يمتص بسرعة ويترك البشرة ناعمة ومشرقة.",
    price: "159",
    oldPrice: null,
    images: [img.violetJar, img.pinkBottles, img.serumPink],
    rating: "4.8",
    reviewCount: 2,
    stock: 52,
    isFeatured: true,
    isBestseller: false,
    isNew: true,
    reviews: [
      { author: "أمل", rating: 5, title: "ترطيب فخم", comment: "بشرتي جافة وهذا الكريم أنقذها، ترطيب يدوم طول اليوم ورائحته ورد فخمة." },
      { author: "روان", rating: 4, title: "حلو ومرطب", comment: "خفيف على البشرة وما يسبب لمعان، أنصح فيه للبشرة الجافة." },
    ],
  },
  {
    slug: "hydrating-toner-mist",
    name: "تونر ومي مرطب بماء الورد",
    brand: "THE ORDINARY",
    category: "skincare",
    shortDescription: "ينعش ويوازن البشرة فوراً",
    description:
      "بخاخ تونر منعش بماء الورد وحمض الهيالورونيك، يوازن درجة حموضة البشرة ويمنحها ترطيباً فورياً ونضارة. يستخدم بعد التنظيف أو لتثبيت المكياج وإنعاش البشرة خلال اليوم.",
    price: "89",
    oldPrice: "119",
    images: [img.cicaMist, img.serumPink, img.pinkBottles],
    rating: "4.5",
    reviewCount: 1,
    stock: 70,
    isFeatured: false,
    isBestseller: false,
    isNew: false,
    reviews: [
      { author: "بيان", rating: 4, title: "منعش", comment: "حلو للإنعاش خلال اليوم ورائحته لطيفة، البخاخ ناعم." },
    ],
  },
  {
    slug: "niacinamide-pore-serum",
    name: "سيرم النياسيناميد لتصغير المسام",
    brand: "THE ORDINARY",
    category: "skincare",
    shortDescription: "يقلل المسام ويضبط الإفرازات الدهنية",
    description:
      "سيرم بتركيبة النياسيناميد ١٠٪ والزنك، يقلل من ظهور المسام الواسعة ويضبط إفراز الدهون ويوحّد ملمس البشرة. مثالي للبشرة الدهنية والمختلطة والمعرّضة للحبوب.",
    price: "75",
    oldPrice: null,
    images: [img.heartleaf, img.serumToner, img.glowSerum],
    rating: "4.7",
    reviewCount: 1,
    stock: 61,
    isFeatured: false,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "عبير", rating: 5, title: "قلل الدهون", comment: "بشرتي دهنية ولاحظت إن اللمعان قل والمسام صارت أصغر، سعره ممتاز." },
    ],
  },
  {
    slug: "argan-repair-hair-oil",
    name: "زيت الشعر المُصلح بالأرغان",
    brand: "KÉRASTASE",
    category: "haircare",
    shortDescription: "يغذي ويلمّع الأطراف المتقصفة",
    description:
      "زيت مغذٍّ بخلاصة الأرغان وزيت الكاميليا، يرطّب الشعر الجاف ويعالج الأطراف المتقصفة ويمنح لمعاناً حريرياً دون ثقل. بضع قطرات كفيلة بترويض الهيشان وحماية الشعر من الحرارة.",
    price: "179",
    oldPrice: "219",
    images: [img.milkBottle, img.haircareRow, img.serumClose],
    rating: "4.9",
    reviewCount: 3,
    stock: 38,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "لطيفة", rating: 5, title: "أنقذ شعري", comment: "شعري كان هايش ومتقصف، بعد أسبوعين صار ناعم ولامع. قطرات بسيطة تكفي." },
      { author: "وجدان", rating: 5, title: "رائحة وخفة", comment: "ما يثقل الشعر أبداً ورائحته فخمة، صار من أساسياتي." },
      { author: "نوف", rating: 5, title: "يستاهل", comment: "أفضل زيت جربته لترطيب الأطراف." },
    ],
  },
  {
    slug: "keratin-repair-shampoo",
    name: "شامبو الكيراتين المُصلح",
    brand: "L'ORÉAL",
    category: "haircare",
    shortDescription: "ينظف بلطف ويقوي الشعر التالف",
    description:
      "شامبو غني بالكيراتين والبروتين، ينظّف الشعر بلطف ويعيد بناء الألياف التالفة من الجذور حتى الأطراف. خالٍ من السلفات، يترك الشعر قوياً ناعماً وسهل التصفيف.",
    price: "95",
    oldPrice: null,
    images: [img.herbalShampoo, img.haircareRow, img.hairSpray],
    rating: "4.6",
    reviewCount: 2,
    stock: 55,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    reviews: [
      { author: "أروى", rating: 5, title: "ناعم من أول غسلة", comment: "شعري صار ناعم وسهل التسريح، ورغوته لطيفة وما تجفف." },
      { author: "مي", rating: 4, title: "جيد", comment: "حلو للشعر التالف بس أفضل مع البلسم من نفس النوع." },
    ],
  },
  {
    slug: "hair-mask-deep-repair",
    name: "ماسك الشعر للترميم العميق",
    brand: "MOROCCANOIL",
    category: "haircare",
    shortDescription: "علاج مكثف للشعر الجاف والمتضرر",
    description:
      "قناع مغذٍّ مكثف يعمل خلال ٥ دقائق على ترميم الشعر التالف والجاف، غني بزيت الأرغان والبروتينات التي تعيد الحيوية واللمعان. للاستخدام مرة أو مرتين أسبوعياً بعد الشامبو.",
    price: "135",
    oldPrice: "165",
    images: [img.haircareRow, img.milkBottle, img.violetJar],
    rating: "4.8",
    reviewCount: 1,
    stock: 44,
    isFeatured: false,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "شذا", rating: 5, title: "نتيجة فورية", comment: "من أول استخدام حسيت الفرق، شعري صار حرير ولامع." },
    ],
  },
  {
    slug: "heat-protectant-spray",
    name: "بخاخ الحماية من الحرارة",
    brand: "GHD",
    category: "styling",
    shortDescription: "يحمي الشعر حتى ٢٣٠ درجة",
    description:
      "بخاخ خفيف يشكّل طبقة حماية على الشعر ضد حرارة أدوات التصفيف حتى ٢٣٠°م، مع منح الشعر لمعاناً ونعومة ومقاومة للهيشان والرطوبة. رذاذ ناعم لا يترك أي بقايا لزجة.",
    price: "119",
    oldPrice: null,
    images: [img.hairSpray, img.haircareRow, img.milkBottle],
    rating: "4.7",
    reviewCount: 1,
    stock: 49,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    reviews: [
      { author: "رهف", rating: 5, title: "ضروري قبل الاستشوار", comment: "صار ضروري في روتيني قبل السشوار، شعري ما تضرر من الحرارة." },
    ],
  },
  {
    slug: "professional-hair-dryer",
    name: "مجفف الشعر الاحترافي أيوني",
    brand: "DYSON",
    category: "devices",
    shortDescription: "تجفيف سريع وحماية من الحرارة الزائدة",
    description:
      "مجفف شعر احترافي بتقنية الأيونات يجفف الشعر بسرعة مع الحفاظ على لمعانه وترطيبه، ومحرك رقمي هادئ وخفيف الوزن. يأتي بثلاث درجات حرارة وسرعتين وفوهات متعددة للتصفيف الدقيق.",
    price: "899",
    oldPrice: "1099",
    images: [img.compact, img.haircareRow, img.paletteBlue],
    rating: "4.9",
    reviewCount: 2,
    stock: 18,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "العنود", rating: 5, title: "يستاهل السعر", comment: "خفيف وسريع وما يحرق الشعر، هدوءه ممتاز مقارنة بالأجهزة الثانية." },
      { author: "بشاير", rating: 5, title: "احترافي", comment: "نتيجة صالون في البيت، أنصح فيه بشدة." },
    ],
  },
  {
    slug: "ceramic-hair-straightener",
    name: "مكواة الشعر السيراميك",
    brand: "GHD",
    category: "devices",
    shortDescription: "فرد ناعم بحرارة موزعة بالتساوي",
    description:
      "مكواة فرد بألواح سيراميك مطلية تسخن بسرعة وتوزّع الحرارة بالتساوي لفرد ناعم دون إتلاف الشعر. تصميم انسيابي يناسب الفرد والتمويج، مع إطفاء تلقائي للأمان.",
    price: "549",
    oldPrice: null,
    images: [img.compact, img.paletteBlue, img.flatlayPurple],
    rating: "4.8",
    reviewCount: 1,
    stock: 22,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    reviews: [
      { author: "تالا", rating: 5, title: "فرد مثالي", comment: "تفرد الشعر من أول مرة وما تحتاج أعيد، ملمس الشعر بعدها حرير." },
    ],
  },
  {
    slug: "signature-eau-de-parfum",
    name: "عطر سيجنتشر أو دو بارفان",
    brand: "CHLOÉ",
    category: "perfume",
    shortDescription: "مزيج زهري فاخر يدوم طويلاً",
    description:
      "عطر نسائي فاخر يفتتح بنفحات الورد والفاوانيا، يتوسطه قلب من الياسمين والفريزيا، وينتهي بقاعدة دافئة من خشب الأرز والمسك. ثبات وفوحان استثنائي يرافقكِ من الصباح حتى المساء.",
    price: "499",
    oldPrice: "599",
    images: [img.perfumeGold, img.perfumeBox, img.perfumeSculpture],
    rating: "4.9",
    reviewCount: 3,
    stock: 27,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "الجوهرة", rating: 5, title: "فخم وثابت", comment: "الرائحة راقية جداً وثباتها ممتاز، يلفت الأنظار كل ما ألبسه." },
      { author: "دلال", rating: 5, title: "عطري المفضل", comment: "زهري ناعم بدون ما يكون ثقيل، مناسب لكل المناسبات." },
      { author: "سمر", rating: 4, title: "جميل", comment: "رائحته حلوة بس أتمنى الفوحان يكون أقوى شوي." },
    ],
  },
  {
    slug: "velvet-oud-perfume",
    name: "عطر فيلفيت عود",
    brand: "VELISIABEAUTY",
    category: "perfume",
    shortDescription: "عود شرقي دافئ بلمسة عصرية",
    description:
      "عطر شرقي فاخر يمزج العود الأصيل بالورد والزعفران، مع قاعدة من العنبر والمسك. تركيبة دافئة وجريئة مصممة للمرأة الواثقة، بثبات يدوم ليوم كامل.",
    price: "389",
    oldPrice: null,
    images: [img.perfumeBlack, img.perfumeGray, img.giftBox],
    rating: "4.8",
    reviewCount: 2,
    stock: 30,
    isFeatured: true,
    isBestseller: false,
    isNew: true,
    reviews: [
      { author: "هيا", rating: 5, title: "عود فخم", comment: "مزيج العود والورد رائع، يناسب المناسبات المسائية والثبات ممتاز." },
      { author: "أسيل", rating: 4, title: "دافئ وجميل", comment: "رائحة شرقية راقية بس تحتاج تجربة قبل الشراء." },
    ],
  },
  {
    slug: "fresh-floral-mist",
    name: "معطر الجسم الزهري المنعش",
    brand: "VICTORIA'S SECRET",
    category: "perfume",
    shortDescription: "رذاذ خفيف بعبير زهري منعش",
    description:
      "معطر جسم خفيف بعبير زهري فاكهي منعش، مثالي للاستخدام اليومي في الطقس الحار. يمنح إحساساً بالانتعاش والنعومة، ويترك بشرتكِ برائحة لطيفة تدوم لساعات.",
    price: "129",
    oldPrice: "159",
    images: [img.perfumeSky, img.perfumeGray, img.serumPink],
    rating: "4.5",
    reviewCount: 1,
    stock: 66,
    isFeatured: false,
    isBestseller: false,
    isNew: false,
    reviews: [
      { author: "ملاك", rating: 5, title: "منعش وخفيف", comment: "حلو للجو الحار ورائحته منعشة، أرشه على طول اليوم." },
    ],
  },
  {
    slug: "gel-nail-polish-set",
    name: "طقم طلاء أظافر جل - وردي",
    brand: "OPI",
    category: "nails",
    shortDescription: "لمعان يدوم أسبوعين دون تقشر",
    description:
      "طقم طلاء أظافر بتركيبة الجل يمنح أظافركِ لوناً وردياً لامعاً يدوم حتى أسبوعين دون تقشّر. تركيبة سريعة الجفاف بفرشاة دقيقة لتطبيق سلس ومتساوٍ.",
    price: "69",
    oldPrice: "89",
    images: [img.lipTints, img.makeupPurple, img.flatlayPurple],
    rating: "4.6",
    reviewCount: 2,
    stock: 73,
    isFeatured: false,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "جنى", rating: 5, title: "ثبات ممتاز", comment: "اللون فخم وثابت لأكثر من أسبوع بدون تقشير، لمعانه حلو." },
      { author: "لين", rating: 4, title: "حلو", comment: "الألوان جميلة بس يحتاج طبقتين للتغطية الكاملة." },
    ],
  },
  {
    slug: "nail-care-cuticle-oil",
    name: "زيت العناية بالأظافر والبشرة",
    brand: "SALLY HANSEN",
    category: "nails",
    shortDescription: "يغذي الأظافر ويرطب الجليدة",
    description:
      "زيت مغذٍّ بفيتامين E وزيت الجوجوبا، يرطّب جلدة الأظافر ويقوّي الأظافر الهشة ويمنحها مظهراً صحياً. القلم بفرشاة عملي للاستخدام اليومي أينما كنتِ.",
    price: "49",
    oldPrice: null,
    images: [img.serumPink, img.dropperBottles, img.serumClose],
    rating: "4.7",
    reviewCount: 1,
    stock: 80,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    reviews: [
      { author: "رغد", rating: 5, title: "قوّى أظافري", comment: "أظافري كانت تتكسر وصارت أقوى، الزيت سهل الاستخدام ورائحته حلوة." },
    ],
  },
  {
    slug: "makeup-brush-set",
    name: "طقم فرش المكياج الاحترافي (١٢ قطعة)",
    brand: "REAL TECHNIQUES",
    category: "devices",
    shortDescription: "فرش ناعمة لتطبيق مثالي",
    description:
      "طقم من ١٢ فرشاة مكياج احترافية بشعيرات صناعية فائقة النعومة لا تتساقط، تغطي كل احتياجاتك من كريم الأساس إلى الظلال والتحديد. يأتي بحقيبة أنيقة لحفظ الفرش وسهولة التنقل.",
    price: "149",
    oldPrice: "199",
    images: [img.flatlayPurple, img.makeupPurple, img.luxuryFlatlay],
    rating: "4.8",
    reviewCount: 2,
    stock: 41,
    isFeatured: false,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "ديمة", rating: 5, title: "نعومة خيالية", comment: "الفرش ناعمة ما تسقّط شعر وتطبق المكياج بشكل احترافي، والحقيبة عملية." },
      { author: "شوق", rating: 4, title: "قيمة ممتازة", comment: "عدد الفرش كبير وجودتها حلوة مقابل السعر." },
    ],
  },
  {
    slug: "glow-highlighter-palette",
    name: "باليت الإضاءة والتحديد",
    brand: "HUDA BEAUTY",
    category: "makeup",
    shortDescription: "إشراقة ذهبية للوجنتين",
    description:
      "باليت إضاءة بأربع درجات ذهبية ووردية بتركيبة حريرية عالية اللمعان تمنح بشرتكِ توهجاً فاخراً. سهل الدمج ويدوم طويلاً لإطلالة مضيئة نهاراً ومساءً.",
    price: "165",
    oldPrice: null,
    images: [img.compact, img.paletteBlue, img.luxuryFlatlay],
    rating: "4.7",
    reviewCount: 1,
    stock: 36,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    reviews: [
      { author: "رتاج", rating: 5, title: "توهج فخم", comment: "الإضاءة ناعمة وطبيعية مو مبالغ فيها، تعطي البشرة توهج حلو." },
    ],
  },
  {
    slug: "matte-liquid-lipstick-nude",
    name: "أحمر شفاه سائل مات - نيود",
    brand: "HUDA BEAUTY",
    category: "makeup",
    shortDescription: "لون نيود دافئ يدوم طوال اليوم",
    description:
      "أحمر شفاه سائل بتركيبة مات مريحة لا تجفف الشفاه، بلون نيود دافئ يناسب البشرة العربية. ثبات استثنائي يدوم لساعات دون بهتان أو انتقال.",
    price: "129",
    oldPrice: "159",
    images: [img.matteLip, img.lipsticksClose, img.lipTints],
    rating: "4.8",
    reviewCount: 2,
    stock: 59,
    isFeatured: true,
    isBestseller: true,
    isNew: true,
    reviews: [
      { author: "يارا", rating: 5, title: "نيود مثالي", comment: "درجة النيود تناسب بشرتي تماماً وثباتها ممتاز، ما ينشف الشفايف." },
      { author: "ندى", rating: 4, title: "حلو", comment: "اللون جميل بس يحتاج مرطب شفايف قبله." },
    ],
  },
  {
    slug: "sunscreen-spf50",
    name: "واقي الشمس اليومي SPF 50",
    brand: "LA ROCHE-POSAY",
    category: "skincare",
    shortDescription: "حماية عالية بلمسة غير دهنية",
    description:
      "واقي شمس بعامل حماية ٥٠ يحمي البشرة من الأشعة فوق البنفسجية دون ترك أثر أبيض أو ملمس دهني. تركيبة خفيفة تصلح كأساس للمكياج ومناسبة للبشرة الحساسة.",
    price: "119",
    oldPrice: null,
    images: [img.pinkBottles, img.serumToner, img.glowSerum],
    rating: "4.9",
    reviewCount: 2,
    stock: 63,
    isFeatured: true,
    isBestseller: true,
    isNew: false,
    reviews: [
      { author: "لولوة", rating: 5, title: "أفضل واقي شمس", comment: "خفيف وما يترك أثر أبيض ولا يسبب لمعان، صار أساسي كل يوم." },
      { author: "حصة", rating: 5, title: "ممتاز تحت المكياج", comment: "يمشي حلو تحت الفاونديشن وما يسبب حبوب." },
    ],
  },
];

async function main() {
  console.log("Clearing existing data...");
  await db.delete(reviews);
  await db.delete(products);

  console.log(`Seeding ${data.length} products...`);
  for (const p of data) {
    const { reviews: productReviews, ...productData } = p;
    const [inserted] = await db.insert(products).values(productData).returning();
    if (productReviews.length) {
      await db.insert(reviews).values(
        productReviews.map((r) => ({
          productId: inserted.id,
          author: r.author,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
        })),
      );
    }
  }
  console.log("Seed complete ✅");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
