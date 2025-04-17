import { $ } from 'zx'
import path from 'node:path'
import fs from 'node:fs/promises'
import dotenv from 'dotenv'

const rootPath = path.resolve(__dirname, '../..')
dotenv.config({ path: path.resolve(rootPath, '.env.local') })

const ProjectName = 'CORS Unblock'
const AppCategory = 'public.app-category.developer-tools'
const DevelopmentTeam = process.env.DEVELOPMENT_TEAM

await $`pnpm wxt build -b safari`
await $`xcrun safari-web-extension-converter --bundle-identifier com.rxliuli.corsUnblock --force --project-location .output .output/safari-mv3`
const projectConfigPath = path.resolve(
  rootPath,
  `.output/${ProjectName}/${ProjectName}.xcodeproj/project.pbxproj`,
)
const packageJson = await import(path.resolve(rootPath, 'package.json'))
const content = await fs.readFile(projectConfigPath, 'utf-8')
await fs.writeFile(
  projectConfigPath,
  content
    .replaceAll(
      'MARKETING_VERSION = 1.0;',
      `MARKETING_VERSION = ${packageJson.version};`,
    )
    .replaceAll(
      `INFOPLIST_KEY_CFBundleDisplayName = "${ProjectName}";`,
      `INFOPLIST_KEY_CFBundleDisplayName = "${ProjectName}";\n				INFOPLIST_KEY_LSApplicationCategoryType = "${AppCategory}";`,
    )
    .replaceAll(
      `COPY_PHASE_STRIP = NO;`,
      `COPY_PHASE_STRIP = NO;\n				DEVELOPMENT_TEAM = ${DevelopmentTeam};`,
    ),
)
