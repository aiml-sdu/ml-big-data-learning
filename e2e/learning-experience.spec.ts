import {expect,test,type Page} from '@playwright/test';
async function noOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);}
test('three lecture routes share navigation and do not expose slide pointers',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Your learning journey'})).toBeVisible();
  await page.getByRole('link',{name:'Start lecture 1'}).click();
  await expect(page.getByRole('heading',{name:'Learning & big data',exact:true})).toBeVisible();
  await expect(page.getByRole('heading',{name:'What this module is based on'})).toHaveCount(0);
  await page.getByRole('link',{name:/Next lecture Preprocessing/}).click();
  await expect(page.getByRole('heading',{name:'Preprocessing & exploration',exact:true})).toBeVisible();
  await expect(page.getByRole('slider',{name:'Income'})).toBeVisible();
  await page.getByRole('link',{name:/Next lecture Clustering/}).click();
  await expect(page.getByRole('button',{name:'Update centers'})).toBeVisible();
  await noOverflow(page);expect(errors).toEqual([]);
});
test('numerical feedback survives topic navigation and reload',async({page})=>{
  await page.goto('/#/lectures/lecture-2');
  const input=page.getByLabel('Your numerical answer');
  await expect(input).toHaveValue('');
  await input.fill('0.25');await page.getByRole('button',{name:'Check calculation'}).click();
  await expect(page.getByRole('status')).toContainText('Revisit');
  await input.fill('0.5');await page.getByRole('button',{name:'Check calculation'}).click();
  await expect(page.getByRole('status')).toContainText('That calculation fits');
  await page.getByRole('button',{name:/Keep the useful directions/}).click();
  await expect(page.getByRole('slider',{name:'Projection angle'})).toBeVisible();
  await page.getByRole('button',{name:/Make the data comparable/}).click();
  await expect(page.getByRole('status')).toContainText('That calculation fits');
  await page.reload();await expect(page.getByLabel('Your numerical answer')).toHaveValue('0.5');
});
test('visual experiments reset and remain usable at narrow widths',async({page})=>{
  for(const width of [1280,390,320]){
    await page.setViewportSize({width,height:900});await page.goto('/#/lectures/lecture-3');
    await page.getByRole('button',{name:/Build clusters one step/}).click();
    await page.getByRole('button',{name:'Update centers'}).click();
    await expect(page.getByRole('button',{name:'Previous step'})).toBeEnabled();
    await page.getByRole('button',{name:'Reset algorithm'}).click();
    await expect(page.getByRole('button',{name:'Previous step'})).toBeDisabled();
    await page.getByRole('button',{name:/Beyond round clusters/}).click();
    await page.getByRole('combobox',{name:'Inspect point'}).selectOption('36');
    await expect(page.getByRole('status')).toContainText('Point 37:');await noOverflow(page);
  }
});
test('earned XP is not duplicated when a completed round is revisited',async({page})=>{
  await page.goto('/#/lectures/lecture-2');
  await page.getByLabel('Your numerical answer').fill('0.5');await page.getByRole('button',{name:'Check calculation'}).click();
  for(let i=0;i<4;i++)await page.getByRole('button',{name:'Continue',exact:true}).click();
  await page.getByRole('radio',{name:'0',exact:true}).evaluate((element)=>(element as HTMLInputElement).click());
  await page.getByRole('button',{name:'Check answer',exact:true}).click();
  await page.getByRole('button',{name:'Finish',exact:true}).click();
  await expect(page.getByText('50 XP',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Finish',exact:true}).click();
  await expect(page.getByText('50 XP',{exact:true})).toBeVisible();await page.reload();
  await expect(page.getByText('50 XP',{exact:true})).toBeVisible();
});
