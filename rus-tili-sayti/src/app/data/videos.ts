export type VideoItem = {
  id: number;
  title: string;
  youtubeId?: string;
  playlistId?: string;
};

export const videos: VideoItem[] = [
  {
    id: 1,
    title: "Катюша (subtitr bilan)",
    youtubeId: "4rhp7Q7Ceq8",
  },
  {
    id: 2,
    title: "Пусть всегда будет солнце (subtitr bilan)",
    youtubeId: "2YoFSyKMMbg",
  },
  {
    id: 3,
    title: "В лесу родилась ёлочка (subtitr bilan)",
    youtubeId: "oZw3cPM1wws",
  },
  {
    id: 4,
    title: "Калинка (subtitr bilan)",
    youtubeId: "pGZ8SVB_vWM",
  },
  {
    id: 5,
    title: "103 ta qo'shiq (to'plam, matn bilan)",
    playlistId: "PL-7NkxlnsDlVQB5wBSWVUyBPjKm5smjDh",
  },
];