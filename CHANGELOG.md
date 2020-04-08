# Change Log

All notable changes to the "poor-code-runner" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [0.1.5] - 2020-4-8

### Changed

- Fix time test command for paths including spaces.
- Add another matching pattern for LOJ.

## [0.1.4] - 2020-3-30

### Changed

- Add support for [LibreOJ](https://loj.ac).
- Optimize the feedback for RE in batch test.

## [0.1.3] - 2020-3-29

### Changed

- Fix the compile command for filenames in the format of `aaa. bbb.cpp` (at least in my environment).

## [0.1.2] - 2020-3-27

### Changed

- Reconstruct and fix batch test.

## [0.1.1] - 2020-3-27

### Changed

- Fix a critical problem.

## [0.1.0] - 2020-3-26

### Added

- Add support for [AtCoder](https://atcoder.jp).
- User now can manually set the problem url of the C++ file by clicking left bottom area displaying current url of the problem (or `Not specified`) or run the command `poor-code-runner.setUrl`.

### Changed

- Change the local storage format.

## [0.0.3] - 2020-3-24

### Changed

- Fix the execution sequence of compile and run

## [0.0.2] - 2020-3-22

### Changed

- Fix a problem in time test.
- Add flags about stack size.
- Make sure to save before compiling.

## [0.0.1] - 2020-2-25

- Initial release