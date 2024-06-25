Elasticsearch v7.17.22

（v8 系はセキュリティがめんどくさかった）

## サービスを起動する

```
$ docker-compose up
```

## インデックス・マッピングを作成する

kibana から実行した

http://localhost:5601/app/dev_tools#/console

```
PUT sample_data
{
  "mappings": {
      "properties" : {
        "guid" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "name" : {
          "type" : "text",
          "fields" : {
            "keyword" : {
              "type" : "keyword",
              "ignore_above" : 256
            }
          }
        },
        "registeredAt" : {
          "type" : "date"
        },
        "userVariables" : {
          "type": "nested",
          "properties" : {
            "definitionUUID" : {
              "type" : "text",
              "fields" : {
                "keyword" : {
                  "type" : "keyword",
                  "ignore_above" : 256
                }
              }
            },
            "valueSelectOptionUUID" : {
              "type" : "text",
              "fields" : {
                "keyword" : {
                  "type" : "keyword",
                  "ignore_above" : 256
                }
              }
            }
          }
        }
      }
  }
}
```

## 仮データを登録する

```
$ node --loader ts-node/esm ./index.ts
```

データ登録を確認する

```
GET sample_data/_search
{
  "query": {
    "match_all": {
    }
  },
  "size": 2000
}
```

## 検索する

```
GET sample_data/_search
{
  "query": {
    "nested": {
      "path": "userVariables",
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "userVariables.definitionUUID.keyword": {
                  "value": "01902fb9-3691-75a7-9e67-60da5fef9963"
                }
              }
            },
            {
              "term": {
                "userVariables.valueSelectOptionUUID.keyword": {
                  "value": "01902fbc-9a35-7d34-a8a3-0fd740450a9c"
                }
              }
            }
          ]
        }
      }
    }
  },
  "size": 2000
}
```
