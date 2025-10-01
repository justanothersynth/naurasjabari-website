<template>
  <div class="page py-4">

    <div class="aside-1 fixed top-0 h-screen col-1 p-4">
      <SectionColumn1 />
      <div class="divider-vert bg-line right-0" />
    </div>

    <main class="main mx-auto w-[640px] col-2 px-4">
      
      <div class="headers relative flex h-30">

        <div class="header-works flex-1">
          <p class="flex flex-col font-bold">
            RECENT WORKS
            <Icon name="iconoir:arrow-down" size="16" class="icon mt-2" />
          </p>
          <div class="divider-horiz bg-line bottom-0" />
        </div>

        <div class="header-contact flex-1 relative pl-4">
          <p class="font-bold">
            CONTACT ME
          </p>
          <ContactCard size="mini" />
          <div class="divider-vert bg-line left-0 top-0 h-full" />
        </div>

      </div>
      
      <div class="flex flex-col gap-12 py-4">
        <ProjectEntry1 />
      </div>
      
    </main>

    <div class="aside-2 fixed top-0 h-screen col-3 p-4">
      <SectionColumn2 />
      <div class="divider-vert bg-line left-0" />
    </div>
    
  </div>
</template>

<style lang="scss" scoped>
.page {
  padding-left: calc((100vw - 640px) / 2);
  padding-right: calc((100vw - 640px) / 2);
  @include customMaxMQ(1233px) {
    display: flex;
    padding-left: 0;
    padding-right: 0;
    width: 100%;
  }
  @include customMaxMQ(1233px) {
    padding-left: 400px;
    padding-right: 0;
  }
  @include medium {
    padding-left: 300px;
  }
  @include small {
    padding-left: 0;
  }
}

.main {
  @include customMaxMQ(1233px) {
    width: auto;
  }
}

.aside-1,
.aside-2 {
  width: 400px;
  @include gridMinMQ {
    width: calc((100% - 640px) / 2);
  }
}

.aside-1 {
  right: calc(50% + (640px / 2));
  @include customMaxMQ(1233px) {
    width: 400px;
    right: auto;
    left: 0;
  }
  @include medium {
    width: 300px;
  }
  @include small {
    display: none;
  }
}

.aside-2 {
  left: calc(50% + (640px / 2));
  @include customMaxMQ(1233px) {
    display: none;
  }
}

.headers {
  @include customMaxMQ(1233px) {
    height: calc(var(--spacing) * 34);
  }
}

.header-works {
  .icon {
    display: none;
    @include customMaxMQ(1233px) {
      display: block;
    }
  }
}

.header-contact {
  display: none;
  @include customMaxMQ(1233px) {
    display: block;
  }
}
</style>
