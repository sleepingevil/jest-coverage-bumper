const writePkg = require("write-pkg");
const coverageBumper = require("./index");
const mockConfig = require(`${__dirname}/package.json`);

jest.mock(`${__dirname}/package`, () => ({
  jest: {
    coverageThreshold: {},
  },
}));

jest.mock("write-pkg", () => ({
  sync: jest.fn(),
}));

describe("jest-coverage-bumper", () => {
  const mockResults = {
    coverageMap: {
      getCoverageSummary: () => ({
        toJSON: () => ({
          statements: {
            covered: 3568,
            total: 4026,
          },
          branches: {
            covered: 2212,
            total: 2301,
          },
          functions: {
            covered: 1635,
            total: 1896,
          },
          lines: {
            covered: 14389,
            total: 32862,
          },
        }),
      }),
    },
  };

  beforeEach(() => {
    mockConfig.jest.coverageThreshold.global = {
      statements: 2,
      branches: 2.4,
      functions: 3.76,
      lines: 11.36,
    };
    process.env.PWD = __dirname;
  });
  afterEach(() => {
    delete process.env.PWD;
    jest.clearAllMocks();
  });
  test("it should return the results it was given", () => {
    expect(coverageBumper(mockResults)).toBe(mockResults);
  });
  test("it should update package.json with the new values", () => {
    coverageBumper(mockResults);
    expect(writePkg.sync).toHaveBeenCalledTimes(1);
    expect(writePkg.sync).toHaveBeenCalledWith(
      {
        jest: {
          coverageThreshold: {
            global: {
              branches: 96.13,
              functions: 86.23,
              lines: 43.78,
              statements: 88.62,
            },
          },
        },
      },
      { normalize: false }
    );
  });
  test("it should not update the package.json if there's no coverage data is results", () => {
    const testResults = {
      no: "results",
    };
    expect(coverageBumper(testResults)).toBe(testResults);
    expect(writePkg.sync).not.toHaveBeenCalled();
  });
  test("it should not update the package.json if threshold >= current coverage", () => {
    mockConfig.jest.coverageThreshold.global = {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    };
    expect(coverageBumper(mockResults)).toBe(mockResults);
    expect(writePkg.sync).not.toHaveBeenCalled();
    mockConfig.jest.coverageThreshold.global = {};
  });
  test("it should work if jestCoverageBumper config is empty in package.json", () => {
    mockConfig.jestCoverageBumper = {};
    coverageBumper(mockResults);
    expect(writePkg.sync).toHaveBeenCalledTimes(1);
    expect(writePkg.sync).toHaveBeenCalledWith(
      {
        jest: {
          coverageThreshold: {
            global: {
              branches: 96.13,
              functions: 86.23,
              lines: 43.78,
              statements: 88.62,
            },
          },
        },
        jestCoverageBumper: {},
      },
      { normalize: false }
    );
    mockConfig.jestCoverageBumper;
  });
  test("it should use the accuracy configured in package.json > jestCoverageBumper config", () => {
    mockConfig.jestCoverageBumper = {
      decimals: 1,
    };
    coverageBumper(mockResults);
    expect(writePkg.sync).toHaveBeenCalledTimes(1);
    expect(writePkg.sync).toHaveBeenCalledWith(
      {
        jest: {
          coverageThreshold: {
            global: {
              branches: 96.1,
              functions: 86.2,
              lines: 43.7,
              statements: 88.6,
            },
          },
        },
        jestCoverageBumper: {
          decimals: 1,
        },
      },
      { normalize: false }
    );
    delete mockConfig.jestCoverageBumper;
  });

  test("it should fall back to 2 decimals if the accuracy configured in package.json is invalid", () => {
    expect.assertions(6);

    ["notANumber", 11, -1].forEach((decimals) => {
      mockConfig.jestCoverageBumper = {
        decimals
      };
      coverageBumper(mockResults);
      expect(writePkg.sync).toHaveBeenCalledTimes(1);
      expect(writePkg.sync).toHaveBeenCalledWith(
        {
          jest: {
            coverageThreshold: {
              global: {
                branches: 96.13,
                functions: 86.23,
                lines: 43.78,
                statements: 88.62,
              },
            },
          },
          jestCoverageBumper: {
            decimals
          },
        },
        { normalize: false }
      );
      delete mockConfig.jestCoverageBumper;
    });
  });

  describe("If process.PWD is not available", () => {
    const originalProcessCWD = process.cwd;

    beforeEach(() => {
      delete process.env.PWD;
      process.cwd = jest.fn(() => __dirname);
    });

    afterEach(() => {
      process.cwd = originalProcessCWD;
    });

    test("it should return the results it was given", () => {
      expect(coverageBumper(mockResults)).toBe(mockResults);
    });
    test("it should update package.json with the new values", () => {
      coverageBumper(mockResults);
      expect(writePkg.sync).toHaveBeenCalledTimes(1);
      expect(writePkg.sync).toHaveBeenCalledWith(
        {
          jest: {
            coverageThreshold: {
              global: {
                branches: 96.13,
                functions: 86.23,
                lines: 43.78,
                statements: 88.62,
              },
            },
          },
        },
        { normalize: false }
      );
    });
  });
});
