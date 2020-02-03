# Automatically Increase your Jest Coverage Threshold

This simple script is for projects that strive for good code coverage but they're not there yet.
It makes sure that the package json has the highest ever number of coverage configured.

## Usage
### Install
`yarn add -D @meza/jest-coverage-bumper`

### Add to your package json
```
{
    ...
    "jest": {
        ...
        "testResultsProcessor": "@meza/jest-coverage-bumper"
    }
}
```

## What if I already have a processor?
Use https://github.com/meza/jest-multiple-result-processors
