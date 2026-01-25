(function (wp) {
  const { __ } = wp.i18n;
  const { registerBlockType } = wp.blocks;
  const { createElement: el, Fragment } = wp.element;
  const { InspectorControls, InnerBlocks, useBlockProps } = wp.blockEditor;
  const { PanelBody, ToggleControl, RangeControl, Notice } = wp.components;

  const ALLOWED_SLIDE = ['aurora/carousel-slide'];

  const parentAttributes = {
    autoplay: { type: 'boolean', default: true },
    autoplayDelay: { type: 'number', default: 3000 },
    speed: { type: 'number', default: 500 },
    pauseOnHover: { type: 'boolean', default: true },
    loop: { type: 'boolean', default: true },
    arrows: { type: 'boolean', default: true },
    dots: { type: 'boolean', default: true },

    slidesPerViewMobile: { type: 'number', default: 1.1 },
    slidesPerViewTablet: { type: 'number', default: 2 },
    slidesPerViewDesktop: { type: 'number', default: 3 },

    spaceBetweenMobile: { type: 'number', default: 12 },
    spaceBetweenTablet: { type: 'number', default: 16 },
    spaceBetweenDesktop: { type: 'number', default: 20 }
  };

  registerBlockType('aurora/carousel', {
    apiVersion: 2,
    title: __('Aurora Carousel', 'aurora-carousel'),
    icon: 'images-alt2',
    category: 'design',
    description: __('Carousel/slider with autoplay, arrows, dots and responsive settings.', 'aurora-carousel'),
    attributes: parentAttributes,
    supports: {
      anchor: true,
      spacing: { margin: true, padding: true },
      color: { background: true, text: false },
      align: ['wide', 'full']
    },

    edit: function Edit(props) {
      const { attributes, setAttributes } = props;

      const blockProps = useBlockProps({
        className: 'aurora-carousel'
      });

      return el(Fragment, {},
        el(InspectorControls, {},
          el(PanelBody, { title: __('Playback', 'aurora-carousel'), initialOpen: true },
            el(ToggleControl, {
              label: __('Autoplay', 'aurora-carousel'),
              checked: !!attributes.autoplay,
              onChange: (v) => setAttributes({ autoplay: v })
            }),
            el(RangeControl, {
              label: __('Autoplay delay (ms)', 'aurora-carousel'),
              value: attributes.autoplayDelay,
              onChange: (v) => setAttributes({ autoplayDelay: v }),
              min: 500, max: 20000, step: 100,
              disabled: !attributes.autoplay
            }),
            el(RangeControl, {
              label: __('Transition speed (ms)', 'aurora-carousel'),
              value: attributes.speed,
              onChange: (v) => setAttributes({ speed: v }),
              min: 100, max: 3000, step: 50
            }),
            el(ToggleControl, {
              label: __('Pause on hover', 'aurora-carousel'),
              checked: !!attributes.pauseOnHover,
              onChange: (v) => setAttributes({ pauseOnHover: v }),
              disabled: !attributes.autoplay
            }),
            el(ToggleControl, {
              label: __('Loop', 'aurora-carousel'),
              checked: !!attributes.loop,
              onChange: (v) => setAttributes({ loop: v })
            })
          ),

          el(PanelBody, { title: __('Controls', 'aurora-carousel'), initialOpen: false },
            el(ToggleControl, {
              label: __('Arrows', 'aurora-carousel'),
              checked: !!attributes.arrows,
              onChange: (v) => setAttributes({ arrows: v })
            }),
            el(ToggleControl, {
              label: __('Dots (pagination)', 'aurora-carousel'),
              checked: !!attributes.dots,
              onChange: (v) => setAttributes({ dots: v })
            })
          ),

          el(PanelBody, { title: __('Responsive', 'aurora-carousel'), initialOpen: false },
            el(Notice, { status: 'info', isDismissible: false },
              __('Set slides per view and gaps for mobile / tablet / desktop.', 'aurora-carousel')
            ),

            el(RangeControl, {
              label: __('Slides per view (Mobile)', 'aurora-carousel'),
              value: attributes.slidesPerViewMobile,
              onChange: (v) => setAttributes({ slidesPerViewMobile: v }),
              min: 1, max: 3, step: 0.1
            }),
            el(RangeControl, {
              label: __('Gap (Mobile, px)', 'aurora-carousel'),
              value: attributes.spaceBetweenMobile,
              onChange: (v) => setAttributes({ spaceBetweenMobile: v }),
              min: 0, max: 60, step: 1
            }),

            el(RangeControl, {
              label: __('Slides per view (Tablet)', 'aurora-carousel'),
              value: attributes.slidesPerViewTablet,
              onChange: (v) => setAttributes({ slidesPerViewTablet: v }),
              min: 1, max: 5, step: 0.1
            }),
            el(RangeControl, {
              label: __('Gap (Tablet, px)', 'aurora-carousel'),
              value: attributes.spaceBetweenTablet,
              onChange: (v) => setAttributes({ spaceBetweenTablet: v }),
              min: 0, max: 80, step: 1
            }),

            el(RangeControl, {
              label: __('Slides per view (Desktop)', 'aurora-carousel'),
              value: attributes.slidesPerViewDesktop,
              onChange: (v) => setAttributes({ slidesPerViewDesktop: v }),
              min: 1, max: 8, step: 0.1
            }),
            el(RangeControl, {
              label: __('Gap (Desktop, px)', 'aurora-carousel'),
              value: attributes.spaceBetweenDesktop,
              onChange: (v) => setAttributes({ spaceBetweenDesktop: v }),
              min: 0, max: 100, step: 1
            })
          )
        ),

        el('div', blockProps,
          el('div', { className: 'aurora-carousel__editor-hint' },
            __('Add "Carousel Slide" blocks inside. Each slide can contain any blocks.', 'aurora-carousel')
          ),
          el(InnerBlocks, {
            allowedBlocks: ALLOWED_SLIDE,
            renderAppender: InnerBlocks.ButtonBlockAppender
          })
        )
      );
    },

    save: function Save(props) {
      const a = props.attributes;
      const blockProps = useBlockProps.save({
        className: 'aurora-carousel',
        'data-autoplay': a.autoplay ? '1' : '0',
        'data-autoplay-delay': String(a.autoplayDelay),
        'data-speed': String(a.speed),
        'data-pause-on-hover': a.pauseOnHover ? '1' : '0',
        'data-loop': a.loop ? '1' : '0',
        'data-arrows': a.arrows ? '1' : '0',
        'data-dots': a.dots ? '1' : '0',
        'data-spv-m': String(a.slidesPerViewMobile),
        'data-spv-t': String(a.slidesPerViewTablet),
        'data-spv-d': String(a.slidesPerViewDesktop),
        'data-gap-m': String(a.spaceBetweenMobile),
        'data-gap-t': String(a.spaceBetweenTablet),
        'data-gap-d': String(a.spaceBetweenDesktop)
      });

      return el('div', blockProps,
        el('div', { className: 'aurora-carousel__viewport' },
          el('div', { className: 'aurora-carousel__track' },
            el(InnerBlocks.Content, null)
          )
        ),
        el('div', { className: 'aurora-carousel__nav', 'aria-hidden': 'true' },
          el('button', { className: 'aurora-carousel__prev', type: 'button', 'aria-label': 'Previous slide' }),
          el('button', { className: 'aurora-carousel__next', type: 'button', 'aria-label': 'Next slide' })
        ),
        el('div', { className: 'aurora-carousel__pagination', 'aria-label': 'Carousel pagination' })
      );
    }
  });

  registerBlockType('aurora/carousel-slide', {
    apiVersion: 2,
    title: __('Carousel Slide', 'aurora-carousel'),
    icon: 'slides',
    category: 'design',
    parent: ['aurora/carousel'],
    description: __('Single slide for Aurora Carousel.', 'aurora-carousel'),
    supports: { reusable: false, html: false },

    edit: function SlideEdit() {
      const blockProps = useBlockProps({ className: 'aurora-carousel__slide' });
      return el('div', blockProps,
        el(InnerBlocks, { renderAppender: InnerBlocks.ButtonBlockAppender })
      );
    },

    save: function SlideSave() {
      const blockProps = useBlockProps.save({ className: 'aurora-carousel__slide' });
      return el('div', blockProps, el(InnerBlocks.Content, null));
    }
  });

})(window.wp);
