# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog],
and this project adheres to [Semantic Versioning].

## [Unreleased]
- /


## [1.6.0] - 2021-09-08

### Added
- suicide command
  - timeouts the command sender for 24 hours

### Changed
- switch to pnpm

### Fixed
- unformatted error logs thrown by TMI
- dynamic command loading


## [1.5.0] - 2021-09-03

### Added
- exec command
  - executes a specified message as the bot
- new logger color for successfully executed commands

### Changed
- dates are now properly formatted for imgur when short values are used

### Fixed
- case-sensitivity issues for whitelists


## [1.4.1] - 2021-09-03

### Changed
- reworked Imgur authentication

### Removed
- leftover debug messages
- request debug messages from Imgur API

### Fixed
- argument parsing of Twitch messages


## [1.4.0] - 2021-08-31

### Added
- join command
  - joins a specified channel
  - saves the channel to the config
- leave command
  - leaves a specified channel
  - if not provided, leaves the current channel
  - removes the channel from the config
- latest and new version notifier
- option for the bot using colored messages

### Changed
- to new TypeScript version
- tsconfig path mapping
- line length limit for doc comments
- improved compile time a lot
- startup now waits for the bot to connect to Twitch IRC
- command issues are now logged in red

### Fixed
- possible undefined config values due to new TS version


## [1.3.1] - 2021-08-26

### Added
- imgur alias add

### Changed
- converted latency to ms


## [1.3.0] - 2021-08-26

### Changed
- imgur command to accept all direct image URLs
  - only with https


## [1.2.4] - 2021-08-23

### Fixed
- response unit of ping command


## [1.2.3] - 2021-08-23

### Added
- info command prefix bot

### Fixed
- version retrieval in info command


## [1.2.2] - 2021-08-23

### Fixed
- vanish rejection message for moderators


## [1.2.1] - 2021-08-23

### Added
- proper logging to the vanish command


## [1.2.0] - 2021-08-22

### Added
- restart command
  - stops the whole bot process and allows systemd to restart it
  - will post restart notification in the channel the command was issued from
  - uses a whitelist
- vanish command
  - timeouts the command sender for a second
  - outputs different messages if the sender is moderator or broadcaster
- whitelist command
  - used to add/remove/list users to/from a specific command whitelist
  - uses a whitelist
- mod requirement checks for commands

### Deprecated
- admin config field in the imgur command


## [1.1.0] - 2021-08-22

### Added
- stop command
  - stops the whole bot process
  - uses a whitelist


## [1.0.1] - 2021-08-22

### Changed
- dynamic command loading to static list as it's incompatible with a single executable

### Fixed
- imgur command whitelist removal logic


## [1.0.0] - 2021-08-22
- initial release


<!-- Links -->
[keep a changelog]: https://keepachangelog.com/en/1.0.0/
[semantic versioning]: https://semver.org/spec/v2.0.0.html

<!-- Versions -->
[unreleased]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.2.4...v1.3.0
[1.2.4]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/RLNT/twitch_rlnt-bot/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/RLNT/twitch_rlnt-bot/releases/tag/v1.0.
