import type {
  ActionRecord,
  AssetRecord,
  ComponentRecord,
  DataRecord,
  DesignRecord,
  PageRecord,
  PrototypeRegistry,
  Registry,
  RegistryEntity
} from "./types";

export function createRegistry<T extends RegistryEntity>(): Registry<T> {
  const entries = new Map<string, T>();

  return {
    register(entry) {
      if (entries.has(entry.id)) {
        throw new Error(`Registry entry already exists: ${entry.id}`);
      }
      const stored = { ...entry };
      entries.set(stored.id, stored);
      return stored;
    },
    get(id) {
      return entries.get(id);
    },
    list() {
      return [...entries.values()];
    },
    update(id, patch) {
      const current = entries.get(id);
      if (!current) {
        throw new Error(`Registry entry does not exist: ${id}`);
      }
      const updated = { ...current, ...patch, id };
      entries.set(id, updated);
      return updated;
    },
    remove(id) {
      const current = entries.get(id);
      entries.delete(id);
      return current;
    }
  };
}

function createPageRegistry(): PrototypeRegistry["pages"] {
  const registry = createRegistry<PageRecord>();
  return {
    registerPage: registry.register,
    getPage: registry.get,
    listPages: registry.list,
    updatePage: registry.update,
    removePage: registry.remove
  };
}

function createComponentRegistry(): PrototypeRegistry["components"] {
  const registry = createRegistry<ComponentRecord>();
  return {
    registerComponent: registry.register,
    getComponent: registry.get,
    listComponents: registry.list,
    updateComponent: registry.update,
    removeComponent: registry.remove
  };
}

function createActionRegistry(): PrototypeRegistry["actions"] {
  const registry = createRegistry<ActionRecord>();
  return {
    registerAction: registry.register,
    getAction: registry.get,
    listActions: registry.list,
    updateAction: registry.update,
    removeAction: registry.remove
  };
}

function createDataRegistry(): PrototypeRegistry["data"] {
  const registry = createRegistry<DataRecord>();
  return {
    registerData: registry.register,
    getData: registry.get,
    listData: registry.list,
    updateData: registry.update,
    removeData: registry.remove
  };
}

function createDesignRegistry(): PrototypeRegistry["design"] {
  const registry = createRegistry<DesignRecord>();
  return {
    registerDesign: registry.register,
    getDesign: registry.get,
    listDesign: registry.list,
    updateDesign: registry.update,
    removeDesign: registry.remove
  };
}

function createAssetRegistry(): PrototypeRegistry["assets"] {
  const registry = createRegistry<AssetRecord>();
  return {
    registerAsset: registry.register,
    getAsset: registry.get,
    listAssets: registry.list,
    updateAsset: registry.update,
    removeAsset: registry.remove
  };
}

export function createPrototypeRegistry(): PrototypeRegistry {
  return {
    pages: createPageRegistry(),
    components: createComponentRegistry(),
    actions: createActionRegistry(),
    data: createDataRegistry(),
    design: createDesignRegistry(),
    assets: createAssetRegistry()
  };
}
