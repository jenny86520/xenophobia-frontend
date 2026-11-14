/**
 * A highlight video's title as the site shows it: the credited member's current nickname follows
 * the title (「殘局 1v3｜小明」), so it changes with the nickname and is never typed into the title.
 */
export function videoTitle(video: { title: string; memberNickname?: string | null }): string {
  return video.memberNickname ? `${video.title}｜${video.memberNickname}` : video.title;
}
