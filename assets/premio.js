const PREMIUM_DEFAULT_MONTHLY_RATE = 0.0195;
const PREMIUM_DEFAULT_GTA_COST = 442.61;
const PREMIUM_DEFAULT_TAG_COST = 2.5;
const PREMIUM_DEFAULT_MONITORING_FEE_RATE = 0.0075;
const PREMIUM_EXAMPLE_PRICE_BY_DATE = {
  "2026-08-19": 1511462.09 / 225,
  "2026-08-21": 574673.49 / 96,
  "2026-08-27": 6423.91,
  "2026-08-28": 6929.42
};
const PREMIUM_TERM_DEFAULTS = [
  {
    title: "JF012026",
    displayTitle: "JF012026-1",
    issueDate: "2026-05-20",
    monthlyRate: 0.0195,
    costPerHead: 4593.98,
    heads: 148,
    deaths: 0
  },
  {
    title: "JF022026",
    displayTitle: "JF022026-1",
    issueDate: "2026-05-21",
    monthlyRate: 0.0195,
    costPerHead: 4513.73,
    heads: 1006,
    deaths: 4
  },
  {
    title: "JF032026",
    displayTitle: "JF032026-1",
    issueDate: "2026-05-22",
    monthlyRate: 0.0195,
    costPerHead: 4434.55,
    heads: 138,
    deaths: 1
  },
  {
    title: "JF042026",
    displayTitle: "JF042026-1",
    issueDate: "2026-05-25",
    monthlyRate: 0.0195,
    costPerHead: 5000,
    heads: 308,
    deaths: 2
  },
  {
    title: "JF052026",
    displayTitle: "JF052026-1",
    issueDate: "2026-05-26",
    monthlyRate: 0.0195,
    costPerHead: 4078.61,
    heads: 1502,
    deaths: 9
  },
  {
    title: "JF062026",
    displayTitle: "JF062026-1",
    issueDate: "2026-05-26",
    monthlyRate: 0.0195,
    costPerHead: 4765.33,
    heads: 540,
    deaths: 3
  },
  {
    title: "JF072026",
    displayTitle: "JF072026-1",
    issueDate: "2026-05-27",
    monthlyRate: 0.0195,
    costPerHead: 4963.36,
    heads: 286,
    deaths: 0
  }
];

const formatCurrency = (value, digits = 0) =>
  Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

const formatNumber = (value, digits = 0) =>
  Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });

const formatDate = (dateKey) => {
  if (!dateKey) return "-";
  const [year, month, day] = String(dateKey).split("-");
  if (!year || !month || !day) return "-";
  return `${day}/${month}/${year}`;
};

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

const normalizeKey = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLocaleUpperCase("pt-BR");

const PREMIUM_FIELD_ALIASES = {
  "Fazenda": ["FAZENDA"],
  "Lote": ["LOTE"],
  "Lastro": ["LASTRO"],
  "STATUS ATUAL": ["STATUS ATUAL"],
  "Número do título": ["NUMERO DO TITULO", "N MERO DO T TULO", "NÚMERO DO TÍTULO", "N�MERO DO T�TULO"],
  "Data de confirmação de abate": [
    "DATA DE CONFIRMACAO DE ABATE",
    "DATA DE CONFIRMA O DE ABATE",
    "DATA DE CONFIRMAÇÃO DE ABATE",
    "DATA DE CONFIRMA��O DE ABATE"
  ],
  "Data de entrada": ["DATA DE ENTRADA"],
  "Peso de carcaça": ["PESO DE CARCACA", "PESO DE CARCA A", "PESO DE CARCAÇA", "PESO DE CARCA�A"],
  "Valor Pago": ["VALOR PAGO", "PGT ABATE", "PGT DE ABATE", "PAGAMENTO ABATE", "ABATE"],
  "Preço/cabeça": ["PRECO CABECA", "PRECO CB", "CB R", "CB R$", "PREÇO CABEÇA", "PREÇO/CABEÇA"]
};

const buildTermDefaultsByTitle = (defaults) => defaults.reduce((acc, row) => {
  acc[normalizeKey(row.title)] = row;
  return acc;
}, {});

let premiumTermDefaultsByTitle = buildTermDefaultsByTitle(PREMIUM_TERM_DEFAULTS);

const parseDateKey = (dateKey) => {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const dateDiffDays = (startKey, endKey) => {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86400000);
};

const parseBrazilianDateKey = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (typeof value === "number" && Number.isFinite(value)) return excelSerialToDateKey(value);
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

function excelSerialToDateKey(serial) {
  const number = Number(serial);
  if (!Number.isFinite(number) || number <= 0) return "";
  const utc = Math.round((number - 25569) * 86400000);
  const date = new Date(utc);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

function parsePtNumber(value) {
  const text = String(value ?? "").trim();
  if (!text) return 0;
  const cleaned = text
    .replace(/[R$\s]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function parseDelimitedText(text, delimiter = ";") {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === "\"") {
      if (inQuotes && next === "\"") {
        value += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === delimiter && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => String(cell).trim())) rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }
  row.push(value);
  if (row.some((cell) => String(cell).trim())) rows.push(row);
  return rows;
}

function premiumRowValue(row, field) {
  const keys = [field, normalizeKey(field), ...(PREMIUM_FIELD_ALIASES[field] || [])];
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") return row[key];
  }
  return "";
}

function normalizePremiumTitle(value) {
  return normalizeKey(String(value || "").replace(/-\d+$/g, ""));
}

function normalizePremiumStatus(value) {
  return normalizeKey(value).replace(/\s+/g, "_");
}

function premiumTermDefault(title) {
  return premiumTermDefaultsByTitle[normalizePremiumTitle(title)] || null;
}

function normalizePremiumCsvRecord(raw) {
  const normalized = {};
  Object.entries(raw).forEach(([key, value]) => {
    normalized[key] = value;
    normalized[normalizeKey(key)] = value;
  });
  const title = String(premiumRowValue(normalized, "Número do título") || "").trim();
  const paymentAmount = parsePtNumber(premiumRowValue(normalized, "Valor Pago"));
  const pricePerHead = parsePtNumber(premiumRowValue(normalized, "Preço/cabeça"));
  return {
    farm: String(premiumRowValue(normalized, "Fazenda") || "").trim(),
    lot: String(premiumRowValue(normalized, "Lote") || "").trim(),
    title,
    titleKey: normalizePremiumTitle(title),
    lastro: String(premiumRowValue(normalized, "Lastro") || "").trim(),
    status: String(premiumRowValue(normalized, "STATUS ATUAL") || "").trim(),
    statusKey: normalizePremiumStatus(premiumRowValue(normalized, "STATUS ATUAL")),
    abateDate: parseBrazilianDateKey(premiumRowValue(normalized, "Data de confirmação de abate")),
    entryDate: parseBrazilianDateKey(premiumRowValue(normalized, "Data de entrada")),
    carcassWeight: parsePtNumber(premiumRowValue(normalized, "Peso de carcaça")),
    paymentAmount,
    pricePerHead,
    raw: normalized
  };
}

function isKnownPremiumHeader(value) {
  const key = normalizeKey(value);
  return Object.entries(PREMIUM_FIELD_ALIASES).some(([field, aliases]) =>
    key === normalizeKey(field) || aliases.includes(key)
  );
}

function premiumHeaderScore(row) {
  return row.reduce((score, cell) => score + (isKnownPremiumHeader(cell) ? 1 : 0), 0);
}

function premiumRecordsFromMatrix(matrix) {
  if (!matrix.length) return [];
  const headerIndex = Math.max(0, matrix.findIndex((row) => premiumHeaderScore(row) >= 4));
  const headers = matrix[headerIndex].map((header) => String(header || "").trim());
  return matrix.slice(headerIndex + 1)
    .map((cells) => {
      const raw = {};
      headers.forEach((header, index) => {
        if (!header) return;
        raw[header] = cells[index] ?? "";
      });
      return normalizePremiumCsvRecord(raw);
    })
    .filter((row) => row.farm || row.title || row.lot);
}

function parsePremiumCsv(text) {
  const firstLine = String(text || "").split(/\r?\n/).find((line) => line.trim()) || "";
  const delimiter = firstLine.includes(";") ? ";" : firstLine.includes("\t") ? "\t" : ",";
  const rows = parseDelimitedText(String(text || ""), delimiter);
  return premiumRecordsFromMatrix(rows);
}

function xlsxColumnIndex(cellRef) {
  const letters = String(cellRef || "").match(/[A-Z]+/i)?.[0] || "A";
  return letters.toUpperCase().split("").reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0) - 1;
}

async function xlsxXml(zip, path) {
  const file = zip.file(path);
  if (!file) return null;
  const text = await file.async("text");
  return new DOMParser().parseFromString(text, "application/xml");
}

function xlsxTextContent(node) {
  return Array.from(node.querySelectorAll("t")).map((item) => item.textContent || "").join("");
}

async function xlsxSharedStrings(zip) {
  const xml = await xlsxXml(zip, "xl/sharedStrings.xml");
  if (!xml) return [];
  return Array.from(xml.querySelectorAll("si")).map(xlsxTextContent);
}

async function xlsxWorkbookSheets(zip) {
  const workbook = await xlsxXml(zip, "xl/workbook.xml");
  const rels = await xlsxXml(zip, "xl/_rels/workbook.xml.rels");
  if (!workbook || !rels) return [];
  const relTargetById = {};
  Array.from(rels.querySelectorAll("Relationship")).forEach((rel) => {
    const id = rel.getAttribute("Id");
    const target = rel.getAttribute("Target") || "";
    if (!id || !target) return;
    relTargetById[id] = target.startsWith("/") ? target.slice(1) : `xl/${target.replace(/^xl\//, "")}`;
  });
  return Array.from(workbook.querySelectorAll("sheet")).map((sheet) => {
    const relId = sheet.getAttribute("r:id") || sheet.getAttribute("id");
    return {
      name: sheet.getAttribute("name") || "",
      path: relTargetById[relId] || ""
    };
  }).filter((sheet) => sheet.path);
}

function xlsxCellValue(cell, sharedStrings) {
  const type = cell.getAttribute("t");
  if (type === "inlineStr") return xlsxTextContent(cell);
  const value = cell.querySelector("v")?.textContent || "";
  if (type === "s") return sharedStrings[Number(value)] || "";
  if (type === "str") return value;
  const number = Number(value);
  return value !== "" && Number.isFinite(number) ? number : value;
}

async function xlsxSheetMatrix(zip, sheet, sharedStrings) {
  const xml = await xlsxXml(zip, sheet.path);
  if (!xml) return [];
  return Array.from(xml.querySelectorAll("sheetData row")).map((row) => {
    const values = [];
    Array.from(row.querySelectorAll("c")).forEach((cell) => {
      values[xlsxColumnIndex(cell.getAttribute("r"))] = xlsxCellValue(cell, sharedStrings);
    });
    return values;
  });
}

function xlsxAbateDateForColumn(rows, rowIndex, colIndex) {
  for (let row = rowIndex; row >= 0; row -= 1) {
    for (let col = Math.max(0, colIndex - 2); col <= colIndex + 2; col += 1) {
      const value = rows[row]?.[col];
      const text = String(value || "");
      const match = text.match(/ABATE\s+(\d{1,2}\/\d{1,2}\/\d{4})/i);
      if (match) return parseBrazilianDateKey(match[1]);
    }
  }
  return "";
}

function xlsxBlockValue(rows, startRow, labelCol, label) {
  const target = normalizeKey(label);
  for (let row = startRow; row < Math.min(rows.length, startRow + 8); row += 1) {
    for (let col = Math.max(0, labelCol - 1); col <= labelCol + 1; col += 1) {
      if (normalizeKey(rows[row]?.[col]) === target) return rows[row]?.[col + 1];
    }
  }
  return "";
}

function xlsxPriceByDateFromSheets(sheets) {
  const grouped = {};
  sheets.forEach((sheet) => {
    sheet.rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (normalizeKey(cell) !== "VALOR PAGO") return;
        const dateKey = xlsxAbateDateForColumn(sheet.rows, rowIndex, colIndex);
        const payment = parsePtNumber(row[colIndex + 1]);
        const heads = parsePtNumber(xlsxBlockValue(sheet.rows, rowIndex, colIndex, "Qtd. Animais"));
        const unitPrice = parsePtNumber(xlsxBlockValue(sheet.rows, rowIndex, colIndex, "CB/R$"));
        if (!dateKey || (!payment && !unitPrice)) return;
        grouped[dateKey] = grouped[dateKey] || { payment: 0, heads: 0, price: 0 };
        grouped[dateKey].payment += payment;
        grouped[dateKey].heads += heads;
        if (unitPrice) grouped[dateKey].price = unitPrice;
      });
    });
  });
  return Object.fromEntries(Object.entries(grouped).map(([dateKey, row]) => [
    dateKey,
    row.payment > 0 && row.heads > 0 ? row.payment / row.heads : row.price
  ]).filter(([, price]) => Number.isFinite(price) && price > 0));
}

async function parsePremiumXlsx(buffer) {
  if (!window.JSZip) throw new Error("Leitor de Excel indisponivel");
  const zip = await JSZip.loadAsync(buffer);
  const sharedStrings = await xlsxSharedStrings(zip);
  const workbookSheets = await xlsxWorkbookSheets(zip);
  const sheets = [];
  for (const sheet of workbookSheets) {
    sheets.push({
      name: sheet.name,
      rows: await xlsxSheetMatrix(zip, sheet, sharedStrings)
    });
  }
  return {
    rows: sheets.flatMap((sheet) => premiumRecordsFromMatrix(sheet.rows)),
    priceByDate: xlsxPriceByDateFromSheets(sheets)
  };
}

function readFileBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo"));
    reader.readAsArrayBuffer(file);
  });
}

function decodedCsvText(buffer) {
  const bytes = new Uint8Array(buffer);
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  const latin = new TextDecoder("iso-8859-1").decode(bytes);
  const score = (text) => (text.match(/\uFFFD|Ã|Â/g) || []).length;
  return score(utf8) <= score(latin) ? utf8 : latin;
}

async function parsePremiumFile(file) {
  const buffer = await readFileBuffer(file);
  const name = String(file.name || "").toLowerCase();
  if (name.endsWith(".xlsx")) return parsePremiumXlsx(buffer);
  if (name.endsWith(".xls")) {
    throw new Error("Arquivo .xls antigo nao abre aqui. Salve como .xlsx ou CSV e suba novamente.");
  }
  return {
    rows: parsePremiumCsv(decodedCsvText(buffer)),
    priceByDate: {}
  };
}

const premiumState = {
  rows: [],
  fileName: "",
  selectedFarm: "",
  selectedDate: "",
  paymentAmount: 0,
  pricePerHead: 0,
  paymentTouched: false,
  priceTouched: false,
  monthlyRate: PREMIUM_DEFAULT_MONTHLY_RATE,
  gtaCost: PREMIUM_DEFAULT_GTA_COST,
  tagCostPerHead: PREMIUM_DEFAULT_TAG_COST,
  monitoringFeeRate: PREMIUM_DEFAULT_MONITORING_FEE_RATE,
  priceByDate: { ...PREMIUM_EXAMPLE_PRICE_BY_DATE },
  rowOverrides: {}
};

const nodes = {
  status: document.getElementById("premium-status"),
  fileInput: document.getElementById("premium-file-input"),
  farmFilter: document.getElementById("premium-farm-filter"),
  dateFilter: document.getElementById("premium-date-filter"),
  paymentInput: document.getElementById("premium-payment-input"),
  priceHeadInput: document.getElementById("premium-price-head-input"),
  monthlyRateInput: document.getElementById("premium-monthly-rate-input"),
  gtaInput: document.getElementById("premium-gta-input"),
  tagInput: document.getElementById("premium-tag-input"),
  monitoringFeeInput: document.getElementById("premium-monitoring-fee-input"),
  kpis: document.getElementById("premium-kpis"),
  memorySubtitle: document.getElementById("premium-memory-subtitle"),
  memoryTable: document.getElementById("premium-memory-table"),
  lotTable: document.getElementById("premium-lot-table"),
  printButton: document.getElementById("print-button")
};

function premiumRowsWithKnownTerm() {
  return premiumState.rows.filter((row) => row.titleKey && premiumTermDefault(row.title));
}

function premiumFarmOptions() {
  const knownRows = premiumRowsWithKnownTerm();
  const sourceRows = knownRows.length ? knownRows : premiumState.rows;
  const counts = sourceRows.reduce((acc, row) => {
    if (!row.farm) return acc;
    acc[row.farm] = (acc[row.farm] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b, "pt-BR"));
}

function premiumDateOptions() {
  return Array.from(new Set(premiumState.rows
    .filter((row) => row.farm === premiumState.selectedFarm)
    .filter((row) => row.statusKey === "ABATIDO")
    .map((row) => row.abateDate)
    .filter(Boolean)))
    .sort()
    .reverse();
}

function syncInput(node, value) {
  if (!node || document.activeElement === node) return;
  node.value = value || "";
}

function applyPremiumDateDefaultPrice() {
  if (premiumState.priceTouched || premiumState.paymentTouched) return;
  premiumState.pricePerHead = premiumState.priceByDate[premiumState.selectedDate] || 0;
}

function premiumSelectedAnimalRows() {
  if (!premiumState.selectedFarm || !premiumState.selectedDate) return [];
  return premiumState.rows.filter((row) =>
    row.farm === premiumState.selectedFarm &&
    row.abateDate === premiumState.selectedDate &&
    row.statusKey === "ABATIDO"
  );
}

function premiumDeathCountByTitle() {
  const deaths = {};
  premiumState.rows
    .filter((row) => row.farm === premiumState.selectedFarm)
    .filter((row) => row.titleKey)
    .filter((row) => row.statusKey.includes("MORTE") || row.statusKey === "MORTO")
    .forEach((row) => {
      deaths[row.titleKey] = (deaths[row.titleKey] || 0) + 1;
    });
  return deaths;
}

function premiumGroupRows() {
  const grouped = new Map();
  premiumSelectedAnimalRows().forEach((row) => {
    const key = row.titleKey || `SEM TITULO ${row.lastro || row.lot}`;
    const current = grouped.get(key) || {
      key,
      title: row.title || "-",
      titleKey: row.titleKey,
      lastros: new Set(),
      lots: new Set(),
      heads: 0,
      carcassWeight: 0,
      rows: []
    };
    current.lastros.add(row.lastro || "-");
    current.lots.add(row.lot || "-");
    current.heads += 1;
    current.carcassWeight += Number(row.carcassWeight || 0);
    current.rows.push(row);
    grouped.set(key, current);
  });
  return Array.from(grouped.values()).sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
}

function premiumLotRows() {
  const grouped = new Map();
  premiumSelectedAnimalRows().forEach((row) => {
    const key = `${row.farm}__${row.titleKey}__${row.lastro}__${row.lot}`;
    const current = grouped.get(key) || {
      farm: row.farm,
      title: row.title || "-",
      titleKey: row.titleKey,
      lastro: row.lastro || "-",
      lot: row.lot || "-",
      heads: 0,
      carcassWeight: 0
    };
    current.heads += 1;
    current.carcassWeight += Number(row.carcassWeight || 0);
    grouped.set(key, current);
  });
  return Array.from(grouped.values()).sort((a, b) =>
    `${a.title}-${a.lot}`.localeCompare(`${b.title}-${b.lot}`, "pt-BR")
  );
}

function premiumPriceFromRows(groups) {
  const explicitPrice = groups
    .flatMap((group) => group.rows)
    .map((row) => Number(row.pricePerHead || 0))
    .find((value) => Number.isFinite(value) && value > 0);
  if (explicitPrice) return explicitPrice;
  const payment = groups
    .flatMap((group) => group.rows)
    .reduce((sum, row) => sum + Number(row.paymentAmount || 0), 0);
  const heads = groups.reduce((sum, group) => sum + Number(group.heads || 0), 0);
  return payment > 0 && heads > 0 ? payment / heads : 0;
}

function premiumNumberOverride(titleKey, field, fallback) {
  const value = Number(premiumState.rowOverrides[titleKey]?.[field]);
  return Number.isFinite(value) ? value : fallback;
}

function premiumCalculatedRows() {
  const groups = premiumGroupRows();
  const totalHeads = groups.reduce((sum, row) => sum + row.heads, 0);
  const pricePerHead = Number(premiumState.pricePerHead || 0) > 0
    ? Number(premiumState.pricePerHead || 0)
    : premiumPriceFromRows(groups) > 0
      ? premiumPriceFromRows(groups)
      : totalHeads > 0
        ? Number(premiumState.paymentAmount || 0) / totalHeads
        : 0;
  const deathCounts = premiumDeathCountByTitle();

  return groups.map((group) => {
    const defaults = premiumTermDefault(group.title);
    const titleKey = group.titleKey || group.key;
    const issueDate = defaults?.issueDate || group.rows.map((row) => row.entryDate).filter(Boolean).sort()[0] || premiumState.selectedDate;
    const monthlyRate = premiumNumberOverride(titleKey, "monthlyRate", defaults?.monthlyRate || premiumState.monthlyRate || PREMIUM_DEFAULT_MONTHLY_RATE);
    const dailyRate = Math.pow(1 + monthlyRate, 1 / 30) - 1;
    const days = Math.max(0, dateDiffDays(issueDate, premiumState.selectedDate));
    const periodRate = Math.pow(1 + dailyRate, days) - 1;
    const costPerHead = premiumNumberOverride(titleKey, "costPerHead", defaults?.costPerHead || 0);
    const deaths = premiumNumberOverride(titleKey, "deaths", Math.max(Number(defaults?.deaths || 0), Number(deathCounts[titleKey] || 0)));
    const gtaCost = premiumNumberOverride(titleKey, "gtaCost", premiumState.gtaCost);
    const revenue = roundMoney(group.heads * pricePerHead);
    const principal = roundMoney(-group.heads * costPerHead);
    const operationCost = roundMoney(principal * periodRate);
    const gta = roundMoney(-gtaCost);
    const tags = roundMoney(-group.heads * premiumState.tagCostPerHead);
    const monitoringFee = roundMoney((principal + operationCost) * premiumState.monitoringFeeRate);
    const deathCost = roundMoney(-deaths * costPerHead * (1 + periodRate));
    const premium = roundMoney(revenue + principal + operationCost + gta + tags + monitoringFee + deathCost);
    return {
      ...group,
      titleKey,
      displayTitle: defaults?.displayTitle || group.title,
      issueDate,
      days,
      monthlyRate,
      periodRate,
      pricePerHead,
      costPerHead,
      deaths,
      gtaCost,
      revenue,
      principal,
      operationCost,
      gta,
      tags,
      monitoringFee,
      deathCost,
      premium,
      amortization: roundMoney(revenue - premium),
      lotsLabel: Array.from(group.lots).filter(Boolean).join(", "),
      lastrosLabel: Array.from(group.lastros).filter(Boolean).join(", ")
    };
  });
}

function premiumTotals(rows) {
  return rows.reduce((total, row) => ({
    heads: total.heads + row.heads,
    deaths: total.deaths + Number(row.deaths || 0),
    revenue: total.revenue + row.revenue,
    principal: total.principal + row.principal,
    operationCost: total.operationCost + row.operationCost,
    gta: total.gta + row.gta,
    tags: total.tags + row.tags,
    monitoringFee: total.monitoringFee + row.monitoringFee,
    deathCost: total.deathCost + row.deathCost,
    premium: total.premium + row.premium,
    amortization: total.amortization + row.amortization
  }), {
    heads: 0,
    deaths: 0,
    revenue: 0,
    principal: 0,
    operationCost: 0,
    gta: 0,
    tags: 0,
    monitoringFee: 0,
    deathCost: 0,
    premium: 0,
    amortization: 0
  });
}

function signedClass(value) {
  const number = Number(value || 0);
  if (number > 0) return "positive";
  if (number < 0) return "negative";
  return "";
}

function premiumInputCell(row, field, value, step = "0.01") {
  const digits = step === "1" ? 0 : 2;
  return `<input class="inline-number premium-row-input" data-premium-title="${escapeHtml(row.titleKey)}" data-premium-field="${field}" type="number" step="${step}" value="${Number(value || 0).toFixed(digits)}">`;
}

function premiumStatementLine(label, value, options = {}) {
  const { note = "", className = "", valueClass = "" } = options;
  return `
    <div class="statement-line ${className}">
      <span>
        ${escapeHtml(label)}
        ${note ? `<small>${escapeHtml(note)}</small>` : ""}
      </span>
      <strong class="${valueClass}">${value}</strong>
    </div>
  `;
}

function premiumStatementInputLine(row, label, field, value, step = "0.01", note = "") {
  return `
    <div class="statement-line is-editable">
      <span>
        ${escapeHtml(label)}
        ${note ? `<small>${escapeHtml(note)}</small>` : ""}
      </span>
      ${premiumInputCell(row, field, value, step)}
    </div>
  `;
}

function premiumStatement(row) {
  return `
    <article class="premium-statement">
      <div class="premium-statement-head">
        <div>
          <strong>${escapeHtml(row.displayTitle)}</strong>
          <span>${escapeHtml(row.lastrosLabel || "-")}</span>
        </div>
        <b>${formatNumber(row.heads)} cab.</b>
      </div>
      <div class="statement-meta">
        <span>Aquisicao ${row.issueDate ? formatDate(row.issueDate) : "-"}</span>
        <span>${formatNumber(row.days)} dias</span>
        <span>${formatCurrency(row.pricePerHead, 2)}/cab.</span>
      </div>
      <div class="statement-lines">
        ${premiumStatementLine("Receita total", formatCurrency(row.revenue, 2), { className: "is-result", valueClass: "positive" })}
        ${premiumStatementInputLine(row, "Custo/cabeca", "costPerHead", row.costPerHead)}
        ${premiumStatementLine("Principal", formatCurrency(row.principal, 2), { valueClass: "negative", note: "abatidos x custo/cabeca" })}
        ${premiumStatementLine("Custo da operacao", formatCurrency(row.operationCost, 2), { valueClass: "negative", note: `taxa periodo ${formatNumber(row.periodRate * 100, 2)}%` })}
        ${premiumStatementInputLine(row, "Mortes", "deaths", row.deaths, "1")}
        ${premiumStatementLine("Custo mortes", formatCurrency(row.deathCost, 2), { valueClass: "negative" })}
        ${premiumStatementInputLine(row, "GTA", "gtaCost", row.gtaCost)}
        ${premiumStatementLine("Brincos", formatCurrency(row.tags, 2), { valueClass: "negative" })}
        ${premiumStatementLine("Fee monitoramento", formatCurrency(row.monitoringFee, 2), { valueClass: "negative" })}
        ${premiumStatementLine("Premio", formatCurrency(row.premium, 2), { className: "is-result", valueClass: signedClass(row.premium) })}
        ${premiumStatementLine("Amortizacao", formatCurrency(row.amortization, 2), { className: "is-result" })}
      </div>
      <div class="statement-foot">${escapeHtml(row.lotsLabel || "-")}</div>
    </article>
  `;
}

function premiumTotalStatement(totals) {
  return `
    <article class="premium-statement is-total">
      <div class="premium-statement-head">
        <div>
          <strong>Total</strong>
          <span>Consolidado da evidencia</span>
        </div>
        <b>${formatNumber(totals.heads)} cab.</b>
      </div>
      <div class="statement-lines">
        ${premiumStatementLine("Receita total", formatCurrency(totals.revenue, 2), { className: "is-result", valueClass: "positive" })}
        ${premiumStatementLine("Principal", formatCurrency(totals.principal, 2), { valueClass: "negative" })}
        ${premiumStatementLine("Custo da operacao", formatCurrency(totals.operationCost, 2), { valueClass: "negative" })}
        ${premiumStatementLine("Mortes", formatNumber(totals.deaths), {})}
        ${premiumStatementLine("Custo mortes", formatCurrency(totals.deathCost, 2), { valueClass: "negative" })}
        ${premiumStatementLine("GTA", formatCurrency(totals.gta, 2), { valueClass: "negative" })}
        ${premiumStatementLine("Brincos", formatCurrency(totals.tags, 2), { valueClass: "negative" })}
        ${premiumStatementLine("Fee monitoramento", formatCurrency(totals.monitoringFee, 2), { valueClass: "negative" })}
        ${premiumStatementLine("Premio", formatCurrency(totals.premium, 2), { className: "is-result", valueClass: signedClass(totals.premium) })}
        ${premiumStatementLine("Amortizacao", formatCurrency(totals.amortization, 2), { className: "is-result" })}
      </div>
    </article>
  `;
}

function renderPremiumFilters() {
  const farms = premiumFarmOptions();
  if (!premiumState.selectedFarm || !farms.includes(premiumState.selectedFarm)) {
    premiumState.selectedFarm = farms[0] || "";
  }
  const dates = premiumDateOptions();
  if (!premiumState.selectedDate || !dates.includes(premiumState.selectedDate)) {
    premiumState.selectedDate = dates[0] || "";
    applyPremiumDateDefaultPrice();
  }
  nodes.farmFilter.innerHTML = farms.length
    ? farms.map((farm) => `<option value="${escapeHtml(farm)}">${escapeHtml(farm)}</option>`).join("")
    : `<option value="">Carregue um CSV</option>`;
  nodes.farmFilter.value = premiumState.selectedFarm;
  nodes.dateFilter.innerHTML = dates.length
    ? dates.map((dateKey) => `<option value="${dateKey}">${formatDate(dateKey)}</option>`).join("")
    : `<option value="">Sem abate</option>`;
  nodes.dateFilter.value = premiumState.selectedDate;
}

function renderPremium() {
  renderPremiumFilters();
  syncInput(nodes.paymentInput, premiumState.paymentAmount ? premiumState.paymentAmount.toFixed(2) : "");
  syncInput(nodes.priceHeadInput, premiumState.pricePerHead ? premiumState.pricePerHead.toFixed(2) : "");
  syncInput(nodes.monthlyRateInput, (premiumState.monthlyRate * 100).toFixed(2));
  syncInput(nodes.gtaInput, premiumState.gtaCost.toFixed(2));
  syncInput(nodes.tagInput, premiumState.tagCostPerHead.toFixed(2));
  syncInput(nodes.monitoringFeeInput, (premiumState.monitoringFeeRate * 100).toFixed(2));

  const rows = premiumCalculatedRows();
  const lotRows = premiumLotRows();
  const totals = premiumTotals(rows);
  const sourceLabel = premiumState.fileName ? premiumState.fileName : "sem arquivo";
  const dateLabel = premiumState.selectedDate ? formatDate(premiumState.selectedDate) : "-";
  const pricePerHead = rows[0]?.pricePerHead || 0;

  nodes.status.textContent = premiumState.rows.length
    ? `${formatNumber(premiumState.rows.length)} animais carregados - ${sourceLabel}`
    : premiumState.fileName
      ? `Arquivo lido - nao encontrei a tabela de animais em ${sourceLabel}`
      : "Aguardando arquivo";

  nodes.memorySubtitle.textContent = premiumState.selectedFarm
    ? `${premiumState.selectedFarm} - abate ${dateLabel}`
    : "Agrupado por titulo e data de abate";

  const missingCosts = rows.filter((row) => !row.costPerHead).length;
  const missingInputs = missingCosts + (rows.length && !pricePerHead ? 1 : 0);
  nodes.kpis.innerHTML = [
    ["Data", dateLabel, premiumState.selectedFarm || "-"],
    ["Animais abatidos", formatNumber(totals.heads), `${formatNumber(rows.length)} titulo${rows.length === 1 ? "" : "s"}`],
    ["Preco/cabeca", pricePerHead ? formatCurrency(pricePerHead, 2) : "-", premiumState.pricePerHead ? "Informado" : "Derivado do valor pago"],
    ["Receita", formatCurrency(totals.revenue, 2), "Preco/cabeca x abatidos"],
    ["Premio", formatCurrency(totals.premium, 2), "Receita menos custos"],
    ["Amortizacao", formatCurrency(totals.amortization, 2), "Receita menos premio"],
    ["Pendencias", formatNumber(missingInputs), pricePerHead ? "Titulos sem custo/cabeca" : "Informe valor pago ou preco/cabeca"]
  ].map(([label, value, note]) => `
    <article class="premium-kpi">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </article>
  `).join("");

  nodes.memoryTable.innerHTML = rows.length
    ? rows.map(premiumStatement).join("") + premiumTotalStatement(totals)
    : `<div class="premium-empty">${premiumState.rows.length ? "Sem animais abatidos para os filtros selecionados" : "Carregue o relatorio do sistema para calcular"}</div>`;

  nodes.lotTable.innerHTML = lotRows.length ? lotRows.map((row) => {
    const average = row.heads ? row.carcassWeight / row.heads : 0;
    return `
      <tr>
        <td>${escapeHtml(row.farm)}</td>
        <td>${escapeHtml(row.title || "-")}</td>
        <td>${escapeHtml(row.lastro || "-")}</td>
        <td>${escapeHtml(row.lot || "-")}</td>
        <td class="num">${formatNumber(row.heads)}</td>
        <td class="num">${formatNumber(row.carcassWeight, 2)} kg</td>
        <td class="num">${formatNumber(average, 2)} kg</td>
      </tr>
    `;
  }).join("") : `
    <tr>
      <td colspan="7">${premiumState.rows.length ? "Sem lotes para os filtros selecionados" : "Carregue o relatorio do sistema para validar os lotes"}</td>
    </tr>
  `;
}

nodes.fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  nodes.status.textContent = "Lendo arquivo...";
  try {
    const parsed = await parsePremiumFile(file);
    premiumState.rows = parsed.rows;
    premiumState.fileName = file.name;
    premiumState.rowOverrides = {};
    premiumState.paymentAmount = 0;
    premiumState.pricePerHead = 0;
    premiumState.paymentTouched = false;
    premiumState.priceTouched = false;
    premiumState.priceByDate = { ...PREMIUM_EXAMPLE_PRICE_BY_DATE, ...(parsed.priceByDate || {}) };
    const farms = premiumFarmOptions();
    premiumState.selectedFarm = farms[0] || "";
    const dates = premiumDateOptions();
    premiumState.selectedDate = dates[0] || "";
    applyPremiumDateDefaultPrice();
    renderPremium();
  } catch (error) {
    nodes.status.textContent = error.message || "Nao foi possivel ler o arquivo";
  }
});

nodes.farmFilter.addEventListener("change", (event) => {
  premiumState.selectedFarm = event.target.value;
  premiumState.selectedDate = "";
  applyPremiumDateDefaultPrice();
  renderPremium();
});

nodes.dateFilter.addEventListener("change", (event) => {
  premiumState.selectedDate = event.target.value;
  applyPremiumDateDefaultPrice();
  renderPremium();
});

nodes.paymentInput.addEventListener("input", (event) => {
  premiumState.paymentAmount = parsePtNumber(event.target.value);
  premiumState.paymentTouched = true;
  if (premiumState.paymentAmount > 0) {
    premiumState.pricePerHead = 0;
    premiumState.priceTouched = false;
  }
  renderPremium();
});

nodes.priceHeadInput.addEventListener("input", (event) => {
  premiumState.pricePerHead = parsePtNumber(event.target.value);
  premiumState.priceTouched = true;
  if (premiumState.pricePerHead > 0) {
    premiumState.paymentAmount = 0;
    premiumState.paymentTouched = false;
  }
  renderPremium();
});

[
  [nodes.monthlyRateInput, "monthlyRate", 100],
  [nodes.gtaInput, "gtaCost", 1],
  [nodes.tagInput, "tagCostPerHead", 1],
  [nodes.monitoringFeeInput, "monitoringFeeRate", 100]
].forEach(([node, field, divisor]) => {
  node.addEventListener("input", (event) => {
    premiumState[field] = parsePtNumber(event.target.value) / divisor;
    renderPremium();
  });
});

nodes.memoryTable.addEventListener("change", (event) => {
  const input = event.target.closest("[data-premium-title][data-premium-field]");
  if (!input) return;
  const title = input.dataset.premiumTitle;
  const field = input.dataset.premiumField;
  premiumState.rowOverrides[title] = {
    ...(premiumState.rowOverrides[title] || {}),
    [field]: parsePtNumber(input.value)
  };
  renderPremium();
});

nodes.printButton.addEventListener("click", () => {
  window.print();
});

renderPremium();
