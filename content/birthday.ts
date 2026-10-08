export type VideoMemory = {
  id: string;
  src: string;
  poster: string;
  title: string;
  caption: string;
  alt: string;
};
export type StickerMoment = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  note: string;
  rotation: number;
};
export const birthday = { 
  name: "Horlicks",
  heroLine: "Happy birthday to my kitty.",
  heroNote: "I made you a tiny world. It is full of things that remind me of you.",
  audioSrc: "/songs/feel-it.mp3",
  audioStartTime: 25, // Song starts at 25 seconds
  audioVolume: 1, // The deployed MP3 is pre-attenuated to 7% for consistent iPhone volume
  videos: [
    {
      id: "smile",
      src: "/media/videos/smile.mp4",
      poster: "/media/posters/smile.jpg",
      title: "That smile",
      caption: "THAT SMILEEEE 😫",
      alt: "A close-up candid video of Horlicks smiling",
    },
    {
      id: "together",
      src: "/media/videos/together.mp4",
      poster: "/media/posters/together.jpg",
      title: "Us",
      caption: "ig u match every person's vibe effortlessly",
      alt: "A candid video of us laughing together",
    },
    {
      id: "cafe",
      src: "/media/videos/solo-cafe.mp4",
      poster: "/media/posters/solo-cafe.jpg",
      title: "moothi mulankada la tippuddi",
      caption: "flex toh bhot krti hai madam ji",
      alt: "A candid cafe video of Horlicks",
    },
    {
      id: "red",
      src: "/media/videos/solo-red.mp4",
      poster: "/media/posters/solo-red.jpg",
      title: "Main-character energy",
      caption: "Yes, kabhi kabhi bhondu but gangster toh ho 💅",
      alt: "A playful full-length video of Horlicks in red and white",
    },
    {
      id: "blue",
      src: "/media/videos/solo-blue.mp4",
      poster: "/media/posters/solo-blue.jpg",
      title: "when ur hair starts hairing, u look like some disney princess ryt???",
      caption: "BLUE ",
      alt: "A relaxed candid video of Horlicks in blue",
    },
  ] satisfies VideoMemory[],
  stickers: [
    {
      id: "spidey",
      src: "/media/stickers/spidey-flowers.jpg",
      alt: "A hand-drawn Spider-Man offering pink flowers",
      caption: "Flowers lelo 😘",
      note: "Your very own budget-friendly Spidey service.",
      rotation: -5,
    },
    {
      id: "cat-rizz",
      src: "/media/stickers/cat-rizz.jpg",
      alt: "A cute cat with bows and doodled sparkles",
      caption: "Cat rizz",
      note: "u got an 8/10 rizz, i give it to u this time.",
      rotation: 4,
    },
    {
      id: "me-cat",
      src: "/media/stickers/me-as-cat.jpg",
      alt: "A fluffy cat wearing a Spider-Man mask and drinking coffee",
      caption: "Me, apparently",
      note: "Trying very hard to look cool in front of you T_T",
      rotation: -3,
    },
    {
      id: "chata",
      src: "/media/stickers/chata-marungi.jpg",
      alt: "A tiny grumpy kitten beside a fist emoji",
      caption: "Chata marungi energy",
      note: "i immediately see this face when u say chata marungi smh",
      rotation: 5,
    },
  ] satisfies StickerMoment[],
  letter: [
    "Oh majesty, manishawww,",
    "Sorry for being late",
    "Not a big fan of writing too much stuff, so ill keep it simple 😅. On your birthday, I hope you see even a little of what I see when u in frnt of me...",
    "Thank you for making me learn so much stuff vro, u actually changed my pov on many things.",
    "I hope this year brings you the kind of happiness you give so naturally to everyone around you. And through all of it, I hope I get to see u achieve what u deserve all by urself gng.",
    "Happy birthday, bhondu.",
  ],
  signature: "At ur service",
 };
