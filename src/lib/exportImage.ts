/**
 * 보드 SVG → PNG 공유 파이프라인 (v1.2-E1).
 * - SVG가 참조하는 CSS 변수를 클론에 인라인 (독립 직렬화 시 색상 유실 방지, 테마 반영)
 * - 워터마크(앱 이름) 하단 스트립 추가 — 단톡 공유 시 출처 표시
 * - Web Share API 우선, 미지원 환경은 PNG 다운로드 폴백
 */
import { track } from './analytics';

/** PitchBoard가 사용하는 CSS 변수 목록 — styles.css와 동기 유지 */
const BOARD_CSS_VARS = [
  '--pitch-grass',
  '--pitch-stripe',
  '--pitch-line',
  '--team-fill',
  '--team-stroke',
  '--team-text',
  '--opp-fill',
  '--opp-stroke',
  '--opp-text',
  '--arrow-run',
  '--arrow-pass',
  '--arrow-press',
] as const;

export async function boardSvgToPngBlob(svg: SVGSVGElement, scale = 10): Promise<Blob> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  const rootStyle = getComputedStyle(document.documentElement);
  for (const name of BOARD_CSS_VARS) {
    clone.style.setProperty(name, rootStyle.getPropertyValue(name).trim());
  }

  const vb = svg.viewBox.baseVal;
  const w = Math.round(vb.width * scale);
  const h = Math.round(vb.height * scale);
  clone.setAttribute('width', String(w));
  clone.setAttribute('height', String(h));

  const xml = new XMLSerializer().serializeToString(clone);
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('SVG 렌더 실패'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
  });

  const strip = Math.round(h * 0.055); // 워터마크 영역
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h + strip;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 미지원');

  ctx.fillStyle = '#0d1410';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, w, h);
  ctx.fillStyle = 'rgba(232, 240, 234, 0.9)';
  ctx.font = `600 ${Math.round(strip * 0.5)}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚽ 택틱북 — 축구 전략·전술 모음집', w / 2, h + strip / 2);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG 인코딩 실패'))), 'image/png')
  );
}

/**
 * 보드 이미지를 공유한다. 반환값: 실제 사용된 방식.
 * Web Share 미지원(데스크톱 브라우저 다수)은 다운로드로 폴백 — 실패가 아니라 정상 경로.
 */
export async function shareBoardImage(
  svg: SVGSVGElement,
  name: string
): Promise<'shared' | 'downloaded'> {
  const blob = await boardSvgToPngBlob(svg);
  const file = new File([blob], `tacticbook-${name}.png`, { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `택틱북 — ${name}` });
      track('image_shared', { method: 'share' });
      return 'shared';
    } catch (e) {
      // 사용자가 공유 시트를 닫은 경우 — 다운로드로 밀어붙이지 않는다
      if ((e as DOMException).name === 'AbortError') return 'shared';
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  track('image_shared', { method: 'download' });
  return 'downloaded';
}
