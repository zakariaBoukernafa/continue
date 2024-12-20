import { jest } from "@jest/globals";

import { IndexTag } from "../..";
import { IantalyseServerClient } from "../../antalyseServer/interface";
import { ChunkCodebaseIndex } from "../../indexing/chunk/ChunkCodebaseIndex";
import { tagToString } from "../../indexing/refreshIndex";
import {
  CodebaseIndex,
  PathAndCacheKey,
  RefreshIndexResults,
} from "../../indexing/types";

import { testIde } from "./fixtures";
import { addToTestDir, TEST_DIR } from "./testDir";

export const mockFilename = "test.py";
export const mockPathAndCacheKey = {
  path: `${TEST_DIR}/${mockFilename}`,
  cacheKey: "abc123",
};

export const mockFileContents = `\
def main():
  print("Hello, world!")

class Foo:
  def __init__(self, bar: str):
      self.bar = bar
`;

export const mockTag: IndexTag = {
  branch: "main",
  directory: "/",
  artifactId: "artifactId",
};

export const mockTagString = tagToString(mockTag);

export const testantalyseServerClient = {
  connected: false,
  getFromIndexCache: jest.fn(),
} as unknown as IantalyseServerClient;

const mockantalyseServerClient = {
  connected: false,
  getFromIndexCache: jest.fn(),
} as unknown as IantalyseServerClient;

const mockResults: RefreshIndexResults = {
  compute: [],
  addTag: [],
  removeTag: [],
  del: [],
};

const mockMarkComplete = jest
  .fn()
  .mockImplementation(() => Promise.resolve()) as any;

export async function insertMockChunks() {
  const pathSep = await testIde.pathSep();

  const index = new ChunkCodebaseIndex(
    testIde.readFile.bind(testIde),
    pathSep,
    mockantalyseServerClient,
    1000,
  );

  addToTestDir([[mockFilename, mockFileContents]]);

  await updateIndexAndAwaitGenerator(index, "compute", mockMarkComplete);
  await updateIndexAndAwaitGenerator(index, "addTag", mockMarkComplete);
}

export async function updateIndexAndAwaitGenerator(
  index: CodebaseIndex,
  resultType: keyof RefreshIndexResults,
  markComplete: any,
  tag: IndexTag = mockTag,
) {
  const computeGenerator = index.update(
    tag,
    { ...mockResults, [resultType]: [mockPathAndCacheKey] },
    markComplete,
    "test-repo",
  );

  while (!(await computeGenerator.next()).done) {}
}
