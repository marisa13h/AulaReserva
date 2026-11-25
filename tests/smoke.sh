#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE_URL:-http://127.0.0.1:8000}"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
curl -fsS "$BASE/api/health" | php -r '$j=json_decode(stream_get_contents(STDIN),true);exit(($j["ok"]??false)?0:1);'
curl -fsS "$BASE/api/aulas" | php -r '$j=json_decode(stream_get_contents(STDIN),true);$list=is_array($j)&&array_is_list($j)?$j:($j["aulas"]??[]);exit(count($list)>=3?0:1);'
DATE="2030-06-15"
CODE=$(curl -sS -o "$TMP/creada.json" -w '%{http_code}' -X POST "$BASE/api/reservas" -H 'Content-Type: application/json' -d '{"aula":1,"fecha":"2030-06-15","hora":"10:00","responsable":"Prueba Actions"}')
echo "HTTP POST /api/reservas: $CODE | BODY: $(cat "$TMP/creada.json")" >&2
test "$CODE" = 201
ID=$(php -r '$j=json_decode(file_get_contents($argv),true);echo $j["id"]??$j["reserva"]["id"]??"";' "$TMP/creada.json")
if [ -z "$ID" ]; then
  ID=$(curl -fsS "$BASE/api/reservas" | php -r '$j=json_decode(stream_get_contents(STDIN),true);$list=is_array($j)&&array_is_list($j)?$j:($j["reservas"]??[]);echo $list["id"]??"";')
fi
test -n "$ID"
CODE=$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$BASE/api/reservas" -H 'Content-Type: application/json' -d '{"aula":1,"fecha":"2030-06-15","hora":"10:00","responsable":"Duplicada"}')
test "$CODE" = 409
curl -fsS "$BASE/api/reservas" | php -r '$j=json_decode(stream_get_contents(STDIN),true);$list=is_array($j)&&array_is_list($j)?$j:($j["reservas"]??[]);exit(count($list)===1?0:1);'
curl -fsS -X DELETE "$BASE/api/reservas/$ID" | php -r '$j=json_decode(stream_get_contents(STDIN),true);exit(!empty($j["mensaje"])?0:1);'
curl -fsS "$BASE/api/reservas" | php -r '$j=json_decode(stream_get_contents(STDIN),true);$list=is_array($j)&&array_is_list($j)?$j:($j["reservas"]??[]);exit(count($list)===0?0:1);'
echo 'OK: aulas, alta, conflicto, consulta y cancelación'
