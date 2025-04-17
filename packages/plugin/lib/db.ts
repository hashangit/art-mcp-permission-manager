export interface Rule {
  id: string
  origin: string
  from: 'website' | 'user'
  hosts?: string[]
  createdAt: string
  updatedAt: string
}

const local = browser.storage.local

class RuleDAO {
  async getAll() {
    const { rules = [] } = await local.get<{ rules: Rule[] }>('rules')
    return rules.sort((a, b) => b.id.localeCompare(a.id))
  }
  async getByOrigin(origin: string): Promise<Rule | undefined> {
    const rules = await this.getAll()
    return rules.find((rule) => rule.origin === origin)
  }
  async add(rule: Rule) {
    const rules = await this.getAll()
    if (rules.find((it) => it.origin === rule.origin)) {
      throw new Error('Rule already exists ' + rule.origin)
    }
    await local.set({ rules: [...rules, rule] })
  }
  async update(rule: Rule) {
    const rules = await this.getAll()
    await local.set({
      rules: rules.map((r) => (r.id === rule.id ? rule : r)),
    })
  }
  async delete(id: string) {
    const rules = await this.getAll()
    await local.set({
      rules: rules.filter((r) => r.id !== id),
    })
  }
}

export const dbApi = {
  meta: new RuleDAO(),
}
