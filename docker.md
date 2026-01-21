## 💾 4. Crear un backup (1 comando)

```bash
docker exec mysql-db \
  mysqldump -u root -proot123 appdb > backups/appdb_$(date +%F).sql
```

Ejemplo de resultado:

```
backups/
└── appdb_2026-01-20.sql
```

---

## ♻️ 5. Restaurar un backup

```bash
docker exec -i mysql-db \
  mysql -u root -proot123 appdb < backups/appdb_2026-01-20.sql
```

---

## 🧼 6. Eliminar el contenedor SIN perder datos

```bash
docker rm -f mysql-db
```

Luego recrear el contenedor usando el mismo comando del paso 2.
Los datos se restauran automáticamente desde la carpeta `data`.

---
