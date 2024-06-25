import { Client } from "@elastic/elasticsearch";
import { fakerJA as faker } from "@faker-js/faker";

const client = new Client({
  node: "http://localhost:9200",
  auth: {
    username: "elastic",
    password: "changeme",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const indexName = "sample_data";

async function createIndex(): Promise<void> {
  try {
    await client.indices.create({ index: indexName });
    console.log(`Index ${indexName} created successfully`);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    console.error("Error creating index:", error);
    throw error;
  }
}

interface SampleDocument {
  guid: string;
  name: string;
  registerInflowSource: string;
  userVariables: UserVariable[];
  registeredAt: Date;
}

interface UserVariable {
  definitionUUID: string;
  valueString: string | undefined;
  valueText: string | undefined;
  valueSelectOptionUUID: string | undefined;
  valueMultipleSelectOptionUUIDs: string[] | undefined;
}

function buildSampleDocument(): SampleDocument {
  return {
    guid: faker.string.uuid(),
    name: faker.person.fullName(),
    userVariables: [
      {
        definitionUUID: "01902fb9-3691-75a7-9e67-60da5fef9963",
        valueString: undefined,
        valueText: undefined,
        valueSelectOptionUUID: "01902fbc-9a35-7d34-a8a3-0fd740450a9c",
        valueMultipleSelectOptionUUIDs: undefined,
      },
    ],
    registerInflowSource: faker.commerce.productName(),
    registeredAt: faker.date.past(),
  };
}

async function insertData(documents: SampleDocument[]): Promise<void> {
  const body = documents.flatMap((doc) => [
    { index: { _index: indexName, _id: doc.guid.toString() } },
    doc,
  ]);

  try {
    const bulkResponse = await client.bulk({ refresh: true, body });

    if (bulkResponse.errors) {
      const erroredDocuments: any[] = [];
      bulkResponse.items.forEach((action: any, i: number) => {
        const operation = Object.keys(action)[0];
        if (action[operation].error) {
          erroredDocuments.push({
            status: action[operation].status,
            error: action[operation].error,
            operation: body[i * 2],
            document: body[i * 2 + 1],
          });
        }
      });
      console.log(erroredDocuments);
    }

    const countResponse = await client.count({ index: indexName });
    console.log(`${countResponse.count} documents indexed`);
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

async function main() {
  try {
    // await createIndex();
    const sampleData = faker.helpers.multiple(buildSampleDocument, {
      count: 5000,
    });
    await insertData(sampleData);
    console.log("Data insertion completed successfully");
  } catch (error) {
    console.error("Error in main function:", error);
  } finally {
    await client.close();
  }
}

main();
