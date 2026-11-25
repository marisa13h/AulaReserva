#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE_URL:-http://127.0.0.1:8000}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
curl -fsS "$BASE/api/health" | php -r '$j=json_decode(stream_get_contents(STDIN),true);exit(($j["ok"]??false)?0:1);'
curl -fsS "$BASE/api/aulas" | php -r '$j=json_decode(stream_get_contents(STDIN),true);exit(count($j["aulas"]??[])>=3?0:1);'
DATE="2030-06-15"
CODE=$(curl -sS -o "$TMP/creada.json" -w '%{http_code}' -X POST "$BASE/api/reservas" -H 'Content-Type: application/json' -d '{"aula_id":1,"fecha":"2030-06-15","hora":"10:00","responsable":"Prueba Actions"}')
test "$CODE" = 201
ID=$(php -r '$j=json_decode(file_get_contents($argv[1]),true);echo $j["id"]??"";' "$TMP/creada.json")
test -n "$ID"
CODE=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BASE/api/reservas" -H 'Content-Type: application/json' -d '{"aula_id":1,"fecha":"2030-06-15","hora":"10:00","responsable":"Duplicada"}')
test "$CODE" = 409
curl -fsS "$BASE/api/reservas" | php -r '$j=json_decode(stream_get_contents(STDIN),true);exit(count($j["reservas"]??[])===1?0:1);'
curl -fsS -X DELETE "$BASE/api/reservas/$ID" | php -r '$j=json_decode(stream_get_contents(STDIN),true);exit(($j["mensaje"]??"")==="Reserva cancelada"?0:1);'
curl -fsS "$BASE/api/reservas" | php -r '$j=json_decode(stream_get_contents(STDIN),true);exit(count($j["reservas"]??[])===0?0:1);'
echo 'OK: aulas, alta, conflicto, consulta y cancelación'