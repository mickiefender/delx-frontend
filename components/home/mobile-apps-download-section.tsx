'use client'

import Image from 'next/image'
import Link from 'next/link'

const ANDROID_LINK = 'https://drive.google.com/'
const IOS_LINK = 'https://apps.apple.com/us/app'

export function MobileAppsDownloadSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-balance">
              Download Delx App Now!
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl">
              Shopping fast and easily more with our app. Get a link to download the app on your phone.
            </p>

            
          </div>

          <div className="flex flex-col items-center lg:items-end gap-4">
            <Link
              href={ANDROID_LINK}
              target="_blank"
              rel="noreferrer"
              aria-label="Download Android app"
              className="inline-flex"
            >
              <Image
                src="/android-app-badge.png"
                alt="Get it on Google Play"
                width={260}
                height={100}
                className="h-[86px] w-auto sm:h-[96px] lg:h-[110px] border border-border rounded-xl bg-background"
                priority
              />
            </Link>

            <Link
              href={IOS_LINK}
              target="_blank"
              rel="noreferrer"
              aria-label="Download Android app"
              className="inline-flex"
            >
              <Image
                src="/apple-icon.png"
                alt="Get it on Google Play"
                width={260}
                height={100}
                className="h-[86px] w-auto sm:h-[96px] lg:h-[110px] border border-border rounded-xl bg-background"
                priority
              />
            </Link>

            <p className="text-xs text-muted-foreground">
              iOS + Android links open in a new tab.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
