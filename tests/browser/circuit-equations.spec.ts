import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { auditSvg } from "../helpers/svg-audit.mjs";
const board = (page: Page) =>
  page.locator('section[aria-label="交互电路画板"] svg').first();
const row = (page: Page, id: string) =>
  page
    .locator("#equation-output tbody tr")
    .filter({ has: page.getByRole("button", { name: id, exact: true }) });
async function at(page: Page, x: number, y: number) {
  const svg = board(page);
  await svg.scrollIntoViewIfNeeded();
  const p = await svg.evaluate(
    (el, p) => {
      const v = new DOMPoint(p[0], p[1]).matrixTransform(
        (el as SVGSVGElement).getScreenCTM()!,
      );
      return { x: v.x, y: v.y };
    },
    [x, y],
  );
  await page.mouse.click(p.x, p.y);
}
async function pin(page: Page, id: string, n: number) {
  await board(page)
    .getByRole("button", { name: `连接 ${id} 端子${n}`, exact: true })
    .click();
}
async function start(page: Page) {
  await page.goto("/tools/equations");
  await expect(
    page.getByRole("button", { name: "新建", exact: true }),
  ).toBeEnabled();
}

test("draw a circuit from an empty board, wire its terminals, and get a computed result", async ({
  page,
}) => {
  await start(page);
  await page.getByRole("button", { name: "新建", exact: true }).click();
  const library = page.getByRole("complementary", { name: "元件库与绘图工具" });
  await library.getByRole("button", { name: "R 电阻 Ω", exact: true }).click();
  await at(page, 280, 120);
  await library.getByRole("button", { name: "R 电阻 Ω", exact: true }).click();
  await at(page, 420, 240);
  await page.getByRole("button", { name: "旋转90°", exact: true }).click();
  await page.getByLabel("元件参数").fill("4");
  await page.getByRole("button", { name: "应用参数", exact: true }).click();
  await library
    .getByRole("button", { name: "V 独立电压源 V", exact: true })
    .click();
  await at(page, 120, 240);
  await pin(page, "V1", 1);
  await at(page, 120, 120);
  await pin(page, "R1", 1);
  await pin(page, "R1", 2);
  await at(page, 420, 120);
  await pin(page, "R2", 1);
  await pin(page, "R2", 2);
  await at(page, 420, 360);
  await at(page, 120, 360);
  await pin(page, "V1", 2);
  await library.getByRole("button", { name: /接地/ }).click();
  await at(page, 300, 360);
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
  await expect(row(page, "R1").locator("td").nth(2)).toHaveText("0.002");
  await expect(
    page.getByRole("region", { name: "自动识别的电路拓扑" }),
  ).toContainText("3");
  await page.getByLabel("分析方法").selectOption("nodal");
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
  await expect(page.locator(".katex-error")).toHaveCount(0);
});
test("parameters, reversal, rotation and undo/redo change actual equations and restore the drawing", async ({
  page,
}) => {
  await start(page);
  await page.getByLabel("选择元件属性").selectOption("R2");
  await page.getByLabel("元件参数").fill("2");
  await page.getByRole("button", { name: "应用参数", exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("6");
  await page.getByLabel("撤销", { exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
  await page.getByLabel("重做", { exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("6");
  await page.getByLabel("选择元件属性").selectOption("R2");
  await page.getByLabel("元件参数").fill("0");
  await page.getByRole("button", { name: "应用参数", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("大于0");
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("6");
  await page.getByLabel("选择元件属性").selectOption("V1");
  await page.getByRole("button", { name: "反转极性", exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("-6");
  await page.getByRole("button", { name: "旋转90°", exact: true }).click();
  await page.getByLabel("分析方法").selectOption("nodal");
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("-6");
  await page.getByLabel("选择元件属性").selectOption("R2");
  await page.getByRole("button", { name: "删除元件", exact: true }).click();
  await expect(row(page, "R2")).toHaveCount(0);
  await expect(row(page, "R1").locator("td").nth(2)).toHaveText("0");
});
test("dragging and keyboard movement keep attached connections and cancel an unfinished wire", async ({
  page,
}) => {
  await start(page);
  await page.getByLabel("分析方法").selectOption("nodal");
  const svg = board(page);
  await svg.scrollIntoViewIfNeeded();
  const p = await svg.evaluate((el) => {
    const m = (el as SVGSVGElement).getScreenCTM()!,
      a = new DOMPoint(280, 120).matrixTransform(m),
      b = new DOMPoint(280, 180).matrixTransform(m);
    return { a: { x: a.x, y: a.y }, b: { x: b.x, y: b.y } };
  });
  await page.mouse.move(p.a.x, p.a.y);
  await page.mouse.down();
  await page.mouse.move(p.b.x, p.b.y, { steps: 6 });
  await page.mouse.up();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
  await svg.getByRole("button", { name: "选择 R1 电阻", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
  await pin(page, "R1", 1);
  await expect(
    page.getByText("点击端子或导线完成；Enter结束，Esc取消"),
  ).toBeVisible();
  await svg.focus();
  await page.keyboard.press("Escape");
  await expect(page.getByText("拖动元件 · 点击端子连线")).toBeVisible();
});
test("drag from the component library and delete a wire without retaining old currents", async ({
  page,
}) => {
  await start(page);
  const svg = board(page);
  await svg.scrollIntoViewIfNeeded();
  const position = await svg.evaluate((el) => {
    const box = el.getBoundingClientRect(),
      p = new DOMPoint(800, 400).matrixTransform(
        (el as SVGSVGElement).getScreenCTM()!,
      );
    return { x: p.x - box.left, y: p.y - box.top };
  });
  await page
    .getByRole("complementary", { name: "元件库与绘图工具" })
    .getByRole("button", { name: "R 电阻 Ω", exact: true })
    .dragTo(svg, { targetPosition: position });
  await expect(page.getByLabel("选择元件属性")).toHaveValue("R3");
  await page.getByRole("button", { name: "删除元件", exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
  await at(page, 180, 120);
  await page.getByRole("button", { name: "删除导线", exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("0");
  await page.getByLabel("撤销", { exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
});
test("mesh and nodal methods handle floating voltage sources and expose real elimination steps", async ({
  page,
}) => {
  await start(page);
  await page.getByLabel("载入电路示例").selectOption("floating");
  await page.getByLabel("分析方法").selectOption("mesh");
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("-1.2");
  await page.getByRole("button", { name: "快速答案", exact: true }).click();
  await expect(
    page.getByText("网孔 1：顺时针 KVL", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("I1：电流源约束", { exact: true })).toBeVisible();
  await page.getByLabel("分析方法").selectOption("nodal");
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("-1.2");
  await page.getByText(/查看实际数值消元过程/).click();
  await expect(page.getByText(/以下增广矩阵使用Y/)).toBeVisible();
  await expect(page.locator(".katex-error")).toHaveCount(0);
  await page.getByRole("button", { name: "学习模式", exact: true }).click();
  await page.getByRole("button", { name: "下一步", exact: true }).click();
  await expect(page.locator('[data-teaching-step="2"]')).toContainText("端子1");
});
test("drawings and netlists export, imported data restores, and drafts survive reload", async ({
  page,
}) => {
  await start(page);
  await page.getByLabel("选择元件属性").selectOption("V1");
  await page.getByLabel("元件参数").fill("18");
  await page.getByRole("button", { name: "应用参数", exact: true }).click();
  await page.reload();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("12");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "保存图纸", exact: true }).click();
  const download = await pending;
  await download.saveAs("test-results/equation-drawing.json");
  const data = JSON.parse(
    await readFile("test-results/equation-drawing.json", "utf8"),
  );
  expect(data.components.find((c: { id: string }) => c.id === "V1").value).toBe(
    18,
  );
  await page.getByRole("button", { name: "新建", exact: true }).click();
  await page
    .getByLabel("导入图纸文件")
    .setInputFiles("test-results/equation-drawing.json");
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("12");
  const netDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出网表", exact: true }).click();
  await (await netDownload).saveAs("test-results/equation-netlist.json");
  const net = JSON.parse(
    await readFile("test-results/equation-netlist.json", "utf8"),
  );
  expect(net.components[0]).not.toHaveProperty("position");
  expect(net.referenceNodeId).toBe("N0");
  await page.getByLabel("导入图纸文件").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "导入失败",
  );
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("12");
});
test("invalid circuits show diagnostics and never retain old solved output", async ({
  page,
}) => {
  await start(page);
  const doc = JSON.parse(
    await page.evaluate(
      () => localStorage.getItem("circuitwiki:equation-document:v1") || "null",
    ),
  );
  void doc;
  await pin(page, "V1", 1);
  await pin(page, "V1", 2);
  await expect(page.locator("main").getByRole("alert")).toContainText(
    /冲突|交叉|符号/,
  );
  await expect(page.locator("#equation-output tbody tr")).toHaveCount(0);
  await page.getByLabel("撤销", { exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
});
test("touch placement, zoom and drawing deletion work on a narrow screen", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await start(page);
  await page.getByRole("button", { name: "新建", exact: true }).tap();
  await page.getByRole("button", { name: "R 电阻 Ω", exact: true }).tap();
  const svg = board(page);
  await svg.scrollIntoViewIfNeeded();
  const p = await svg.evaluate((el) => {
    const p = new DOMPoint(200, 160).matrixTransform(
      (el as SVGSVGElement).getScreenCTM()!,
    );
    return { x: p.x, y: p.y };
  });
  await page.touchscreen.tap(p.x, p.y);
  await expect(page.getByLabel("选择元件属性")).toHaveValue("R1");
  await page.getByRole("button", { name: "放大画板", exact: true }).tap();
  await expect(
    page.getByRole("button", { name: "125%", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "删除元件", exact: true }).tap();
  await expect(page.getByLabel("选择元件属性").locator("option")).toHaveCount(
    1,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await context.close();
});
test("repeated rotation preserves the circuit and undo/redo restores safe wiring", async ({
  page,
}) => {
  await start(page);
  await page.getByLabel("分析方法").selectOption("nodal");
  await page.getByLabel("选择元件属性").selectOption("R1");
  for (let i = 0; i < 12; i++) {
    await page.getByRole("button", { name: "旋转90°", exact: true }).click();
    await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
    const d = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("circuitwiki:equation-document:v1")!),
    );
    expect(
      d.wires.every((w: { points: unknown[] }) => w.points.length < 20),
    ).toBe(true);
    const audit = await board(page).evaluate(auditSvg);
    expect(audit.collisions, `rotation ${i}`).toEqual([]);
  }
  await page.getByLabel("撤销", { exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
  await page.getByLabel("重做", { exact: true }).click();
  await expect(row(page, "R2").locator("td").nth(1)).toHaveText("8");
});

test("both source symbols keep separated upright labels through four rotations", async ({
  page,
}) => {
  await start(page);
  for (const kind of ["V 独立电压源 V", "I 独立电流源 A"]) {
    await page.getByRole("button", { name: "新建", exact: true }).click();
    await page.getByRole("button", { name: kind, exact: true }).click();
    await at(page, 400, 300);
    for (let i = 0; i < 4; i++) {
      const audit = await board(page).evaluate(auditSvg);
      expect(audit.collisions, kind + " rotation " + i).toEqual([]);
      await page.getByRole("button", { name: "旋转90°", exact: true }).click();
    }
  }
});

test("reference ground avoids the T branch, moves without merging nodes, and rejects invalid contacts", async ({
  page,
}) => {
  await start(page);
  await page.getByLabel("载入电路示例").selectOption("injection");
  const currents = await page
    .locator("#equation-output tbody tr td:nth-child(3)")
    .allTextContents();
  await page.getByRole("button", { name: /⏚ 接地/ }).click();
  await at(page, 420, 120);
  let d = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("circuitwiki:equation-document:v1")!),
  );
  expect(d.grounds).toHaveLength(1);
  expect(d.grounds[0].position).toEqual([420, 120]);
  expect(
    await page
      .locator("#equation-output tbody tr td:nth-child(3)")
      .allTextContents(),
  ).toEqual(currents);
  expect((await board(page).evaluate(auditSvg)).collisions).toEqual([]);
  await board(page)
    .getByRole("button", { name: `选择接地 ${d.grounds[0].id}` })
    .focus();
  await page.keyboard.press("Delete");
  d = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("circuitwiki:equation-document:v1")!),
  );
  expect(d.grounds).toHaveLength(0);
  await page.getByRole("button", { name: /⏚ 接地/ }).click();
  await at(page, 120, 240);
  await expect(page.locator("main").getByRole("alert")).toContainText("内部");
  await at(page, 800, 500);
  await expect(page.locator("main").getByRole("alert")).toContainText("空白");
});

for (const [width, theme] of [
  [1440, "light"],
  [390, "dark"],
] as const)
  test(`starter circuits have clear labels and no page overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(
      (t) => localStorage.setItem("circuitwiki-theme-monochrome", t),
      theme,
    );
    await start(page);
    for (const id of ["divider", "injection", "floating"]) {
      await page.getByLabel("载入电路示例").selectOption(id);
      for (const method of ["nodal", "mesh"]) {
        await page.getByLabel("分析方法").selectOption(method);
        const result = await board(page).evaluate(auditSvg);
        expect(result.collisions, `${id} ${method}`).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        ).toBe(true);
        await expect(page.locator(".katex-error")).toHaveCount(0);
      }
    }
  });
