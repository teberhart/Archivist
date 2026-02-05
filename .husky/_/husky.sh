#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  debug () {
    if [ "$HUSKY_DEBUG" = "1" ]; then
      echo "husky (debug) - $1"
    fi
  }

  readonly hook_name="$(basename "$0")"
  debug "starting ${hook_name}..."

  if [ "$HUSKY" = "0" ]; then
    debug "HUSKY=0, skipping hook"
    exit 0
  fi

  if [ -f ~/.huskyrc ]; then
    debug "sourcing ~/.huskyrc"
    . ~/.huskyrc
  fi

  if [ -f ~/.config/husky/init.sh ]; then
    debug "sourcing ~/.config/husky/init.sh"
    . ~/.config/husky/init.sh
  fi

  export husky_skip_init=1
  sh -e "$0" "$@"
  exit $?
fi
