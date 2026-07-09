/**
 * 라이브러리 전술 보드 → JSON 파일 (GRF 전술 실행기 입력용).
 * 사용: npx tsx scripts/grf/export-board.ts <전술id> [출력경로]
 */
import { writeFileSync } from 'node:fs';
import { getTactic } from '../../src/data';

const id = process.argv[2] ?? 'a-counter';
const out = process.argv[3] ?? `scripts/grf/board-${id}.json`;

const t = getTactic(id);
if (!t) {
  console.error(`전술 없음: ${id}`);
  process.exit(1);
}
writeFileSync(out, JSON.stringify({ id: t.id, name: t.name, board: t.board }, null, 2));
console.log(`✓ ${out} — ${t.name} (스텝 ${t.board.steps?.length ?? 0}개)`);
